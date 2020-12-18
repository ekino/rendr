<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Link;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Url;
use Drupal\ekino_rendr\Entity\PageInterface;
use Drupal\ekino_rendr\Repository\ContentRepositoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class PageController extends ControllerBase implements ContainerInjectionInterface
{
    /**
     * The date formatter service.
     *
     * @var DateFormatterInterface
     */
    protected $dateFormatter;

    /**
     * The renderer service.
     *
     * @var RendererInterface
     */
    protected $renderer;

    /**
     * The page repository service.
     *
     * @var ContentRepositoryInterface
     */
    protected $pageRepository;

    /**
     * The entity repository service.
     *
     * @var EntityRepositoryInterface
     */
    protected $entityRepository;

    /**
     * Constructs a PageController object.
     *
     * @param DateFormatterInterface     $dateFormatter
     *                                                     The date formatter service
     * @param RendererInterface          $renderer
     *                                                     The renderer service
     * @param contentRepositoryInterface $pageRepository
     *                                                     The entity repository
     * @param EntityRepositoryInterface  $entityRepository
     *                                                     The entity repository
     */
    public function __construct(
        DateFormatterInterface $dateFormatter,
        RendererInterface $renderer,
        ContentRepositoryInterface $pageRepository,
        EntityRepositoryInterface $entityRepository = null
    ) {
        $this->dateFormatter = $dateFormatter;
        $this->renderer = $renderer;
        if (!$entityRepository) {
            @\trigger_error('The entity.repository service must be passed to PageController::__construct(), it is required before Drupal 9.0.0. See https://www.drupal.org/node/2549139.', E_USER_DEPRECATED);
            $entityRepository = \Drupal::service('entity.repository');
        }
        $this->pageRepository = $pageRepository;
        $this->entityRepository = $entityRepository;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('date.formatter'),
            $container->get('renderer'),
            $container->get('ekino_rendr.repository.page'),
            $container->get('entity.repository')
        );
    }

    /**
     * Displays a page revision.
     *
     * @param int $pageRevision
     *                          The page revision ID
     *
     * @return array
     *               An array suitable for \Drupal\Core\Render\RendererInterface::render()
     */
    public function revisionShow(int $pageRevision)
    {
        $page = $this->entityTypeManager()->getStorage('ekino_rendr_page')->loadRevision($pageRevision);
        $page = $this->entityRepository->getTranslationFromContext($page);
        $viewController = new ContentViewController($this->entityTypeManager(), $this->renderer);
        $page = $viewController->view($page);

        return $page;
    }

    /**
     * Displays the latest page revision.
     *
     * @param int $ekino_rendr_page
     *                              The page id
     *
     * @return array
     *               An array suitable for \Drupal\Core\Render\RendererInterface::render()
     */
    public function showLatest(int $ekino_rendr_page)
    {
        $page = $this->pageRepository->getLatestRevision($ekino_rendr_page);
        $viewController = new ContentViewController($this->entityTypeManager(), $this->renderer);
        $page = $viewController->view($page);

        return $page;
    }

    /**
     * Generates an overview table of older revisions of a page.
     *
     * @param pageInterface $ekino_rendr_page
     *                                        A page object
     *
     * @return array
     *               An array as expected by \Drupal\Core\Render\RendererInterface::render()
     */
    public function revisionOverview(PageInterface $ekino_rendr_page)
    {
        $page = $ekino_rendr_page;
        $account = $this->currentUser();
        $langcode = $page->language()->getId();
        $langname = $page->language()->getName();
        $languages = $page->getTranslationLanguages();
        $hasTranslations = (\count($languages) > 1);
        $pageStorage = $this->entityTypeManager()->getStorage('ekino_rendr_page');

        $build['#title'] = $hasTranslations ? $this->t('@langname revisions for %title',
            ['@langname' => $langname, '%title' => $page->label()]
        ) : $this->t('Revisions for %title', ['%title' => $page->label()]);
        $header = [$this->t('Revision'), $this->t('Operations')];

        $revertPermission = (($account->hasPermission('revert ekino_rendr_page revisions') ||
                $account->hasPermission('revert all revisions') ||
                $account->hasPermission('administer ekino_rendr_page')) &&
            $page->access('update'));
        $deletePermission = (($account->hasPermission('delete ekino_rendr_page revisions') ||
                $account->hasPermission('delete all revisions') ||
                $account->hasPermission('administer ekino_rendr_page')) &&
            $page->access('delete'));

        $rows = [];
        $defaultRevision = $page->getRevisionId();
        $currentRevisionDisplayed = false;

        foreach ($this->getRevisionIds($page, $pageStorage) as $vid) {
            /** @var PageInterface $revision */
            $revision = $pageStorage->loadRevision($vid);
            // Only show revisions that are affected by the language that is being
            // displayed.
            if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
                $username = [
                    '#theme' => 'username',
                    '#account' => $revision->getRevisionUser(),
                ];

                // Use revision link to link to revisions that are not active.
                $date = $this->dateFormatter->format($revision->get('revision_created')->value, 'short');

                // We treat also the latest translation-affecting revision as current
                // revision, if it was the default revision, as its values for the
                // current language will be the same of the current default revision in
                // this case.
                $isCurrentRevision = $vid == $defaultRevision || (!$currentRevisionDisplayed && $revision->wasDefaultRevision());
                if (!$isCurrentRevision) {
                    $link = Link::fromTextAndUrl($date, new Url(
                        'entity.ekino_rendr_page.revision', [
                            'ekino_rendr_page' => $page->id(),
                            'page_revision' => $vid,
                        ]))->toString();
                } else {
                    $link = $page->toLink($date)->toString();
                    $currentRevisionDisplayed = true;
                }

                $row = [];
                $column = [
                    'data' => [
                        '#type' => 'inline_template',
                        '#template' => '{% trans %}{{ date }} by {{ username }}{% endtrans %}{% if message %}<p class="revision-log">{{ message }}</p>{% endif %}',
                        '#context' => [
                            'date' => $link,
                            'username' => $this->renderer->renderPlain($username),
                            'message' => [
                                '#markup' => $revision->get('revision_log_message')->value,
                                '#allowed_tags' => Xss::getHtmlTagList(),
                            ],
                        ],
                    ],
                ];

                $this->renderer->addCacheableDependency($column['data'], $username);
                $row[] = $column;

                if ($isCurrentRevision) {
                    $row[] = [
                        'data' => [
                            '#prefix' => '<em>',
                            '#markup' => $this->t('Current revision'),
                            '#suffix' => '</em>',
                        ],
                    ];

                    $rows[] = [
                        'data' => $row,
                        'class' => ['revision-current'],
                    ];
                } else {
                    $links = [];
                    if ($revertPermission) {
                        $links['revert'] = [
                            'title' => $vid < $page->getRevisionId() ? $this->t('Revert') : $this->t('Set as current revision'),
                            'url' => $hasTranslations ?
                                Url::fromRoute(
                                    'ekino_rendr_page.revision_revert_translation_confirm', [
                                        'ekino_rendr_page' => $page->id(),
                                        'page_revision' => $vid,
                                        'langcode' => $langcode,
                                    ]) :
                                Url::fromRoute('ekino_rendr_page.revision_revert_confirm', [
                                    'ekino_rendr_page' => $page->id(),
                                    'page_revision' => $vid,
                                ]),
                        ];
                    }

                    if ($deletePermission) {
                        $links['delete'] = [
                            'title' => $this->t('Delete'),
                            'url' => Url::fromRoute(
                                'ekino_rendr_page.revision_delete_confirm', [
                                'ekino_rendr_page' => $page->id(), 'page_revision' => $vid,
                            ]),
                        ];
                    }

                    $row[] = [
                        'data' => [
                            '#type' => 'operations',
                            '#links' => $links,
                        ],
                    ];

                    $rows[] = $row;
                }
            }
        }

        $build['page_revisions_table'] = [
            '#theme' => 'table',
            '#rows' => $rows,
            '#header' => $header,
            '#attached' => [
                'library' => ['node/drupal.node.admin'],
            ],
            '#attributes' => ['class' => 'node-revision-table'],
        ];

        $build['pager'] = ['#type' => 'pager'];

        return $build;
    }

    /**
     * Gets a list of page revision IDs for a specific page.
     *
     * @param PageInterface $page
     *                            The page entity
     *
     * @return int[]
     *               Page revision IDs (in descending order)
     */
    protected function getRevisionIds(PageInterface $page, EntityStorageInterface $pageStorage)
    {
        $result = $pageStorage->getQuery()
            ->allRevisions()
            ->condition($page->getEntityType()->getKey('id'), $page->id())
            ->sort($page->getEntityType()->getKey('revision'), 'DESC')
            ->pager(20)
            ->execute();

        return \array_keys($result);
    }
}
