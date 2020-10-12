<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\ekino_rendr\Entity\Page;
use Drupal\ekino_rendr\Entity\Template;
use Drupal\ekino_rendr\Event\UrlEvent;
use Drupal\ekino_rendr\Model\PageFormTemplate;
use Drupal\ekino_rendr\Tool\UrlGenerator;
use Drupal\user\Entity\User;
use Drupal\user\UserInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

final class PageUpsertForm extends ContentEntityForm
{
    protected $messenger;
    protected $stringTranslation;
    protected $dateFormatter;
    protected $currentUser;
    protected $entityTypeManager;
    protected $eventDispatcher;

    /**
     * {@inheritdoc}
     */
    public function __construct(
        EntityRepositoryInterface $entityRepository,
        MessengerInterface $messenger,
        TranslationInterface $translation,
        DateFormatterInterface $dateFormatter,
        AccountProxyInterface $accountProxy,
        EntityTypeManagerInterface $entityTypeManager,
        EventDispatcherInterface $eventDispatcher,
        EntityTypeBundleInfoInterface $entityTypeBundleInfo = null,
        TimeInterface $time = null
    ) {
        parent::__construct($entityRepository, $entityTypeBundleInfo, $time);
        $this->messenger = $messenger;
        $this->stringTranslation = $translation;
        $this->dateFormatter = $dateFormatter;
        $this->currentUser = $accountProxy;
        $this->entityTypeManager = $entityTypeManager;
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        return new self(
            $container->get('entity.repository'),
            $container->get('messenger'),
            $container->get('string_translation'),
            $container->get('date.formatter'),
            $container->get('current_user'),
            $container->get('entity_type.manager'),
            $container->get('event_dispatcher'),
            $container->get('entity_type.bundle.info'),
            $container->get('datetime.time')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function form(array $form, FormStateInterface $formState)
    {
        if (!$this->entity instanceof Page) {
            throw new \LogicException();
        }

        $entityType = $this->entity->getEntityType();
        if (!$entityType instanceof ContentEntityTypeInterface) {
            throw new \LogicException();
        }

        $user = User::load(\Drupal::currentUser()->id());
        $form = parent::form($form, $formState) + [
                '#theme' => 'node_edit_form',
                '#attached' => [
                    'library' => [
                        'node/form',
                        'seven/node-form',
                    ],
                ],
                'rendr_containers' => [
                    '#type' => 'horizontal_tabs',
                    '#weight' => 2,
                ],
            ];
        $form['advanced']['#type'] = 'container';
        $form['advanced']['#attributes']['class'][] = 'entity-meta';

        $form['meta'] = [
            '#type' => 'container',
            '#group' => 'advanced',
            '#attributes' => ['class' => ['entity-meta__header']],
        ];
        $form['meta_details'] = [
            '#type' => 'container',
            '#group' => 'advanced',
            '#weight' => 2,
        ];
        $form['meta_url_alias'] = [
            '#type' => 'container',
            '#group' => 'advanced',
            '#weight' => 3,
        ];

        $form['meta']['status'] = [
            '#type' => 'item',
            '#markup' => $this->entity->isPublished() ? $this->t('Published') : $this->t('Not published'),
            '#access' => !$this->entity->isNew(),
            '#wrapper_attributes' => ['class' => ['entity-meta__title']],
            '#weight' => 20,
        ];
        $form['meta']['preview_urls'] = [
            '#type' => 'item',
            '#markup' => $this->generatePreviewUrlsTable($user),
            '#weight' => 22,
        ];

        $form['meta_details']['sidebar_details'] = [
            '#type' => 'details',
            '#title' => $this->t('Details'),
            '#weight' => 50,
            '#open' => true,
        ];

        $form['meta']['sidebar_seo'] = [
            '#type' => 'details',
            '#title' => $this->t('SEO'),
            '#weight' => 49,
        ];

        $form['meta_url_alias']['sidebar_url_alias'] = [
            '#type' => 'details',
            '#title' => $this->t('Url Alias'),
            '#weight' => 53,
        ];

        $form[$entityType->getRevisionMetadataKey('revision_log_message')]['#group'] = 'meta';
        $form[$entityType->getRevisionMetadataKey('revision_log_message')]['#weight'] = 22;

        $form['parent_page']['#group'] = 'sidebar_details';
        $form['langcode']['#group'] = 'sidebar_details';
        $form['channels']['#group'] = 'sidebar_details';
        $form['ttl']['#group'] = 'sidebar_details';
        $form['published']['#group'] = 'sidebar_details';

        $form['seo_title']['#group'] = 'sidebar_seo';
        $form['seo_description']['#group'] = 'sidebar_seo';

        $form['path']['#group'] = 'sidebar_url_alias';
        $form['url_alias']['#group'] = 'sidebar_url_alias';

        \uasort($form, function ($a, $b) {
            if (!\is_array($a) || !\array_key_exists('#weight', $a)) {
                return -1;
            }
            if (!\is_array($b) || !\array_key_exists('#weight', $b)) {
                return 1;
            }

            return $a['#weight'] <=> $b['#weight'];
        });

        // Manage container tabs
        $inheritedContainers = $this->entity->get('container_inheritance')->value ?
            \explode(',', $this->entity->get('container_inheritance')->value) :
            [];

        foreach (\array_keys($form) as $fieldKey) {
            if (\preg_match(Template::CONTAINER_KEY_PATTERN, $fieldKey, $matches)) {
                $form[$matches[1].'_section'] = [
                    '#type' => 'details',
                    '#title' => $this
                        ->t(\str_replace('_', ' ', $matches[1])),
                    '#weight' => $form[$fieldKey]['#weight'] ?? 0,
                    '#group' => 'rendr_containers',
                ];

                $form[$matches[1].'_section'][$matches[1].'_container_inheritance'] = [
                    '#type' => 'checkbox',
                    '#title' => $this
                        ->t('Inherit from parent Page'),
                    '#default_value' => \in_array($matches[1], $inheritedContainers) ? 1 : 0,
                ];
                $form[$matches[1].'_section'][$fieldKey] = $form[$fieldKey];
                $form[$matches[1].'_section'][$fieldKey]['#states'] = [
                    //show this field only if not inherited
                    'visible' => [
                        \sprintf(':input[name="%s_container_inheritance"]', $matches[1]) => ['checked' => false],
                    ],
                ];
                unset($form[$fieldKey]);
            }
        }

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $formState)
    {
        // Path unicity and validity
        if (!empty($formState->getValue('path')[0]['value'])) {
            if (0 !== \strpos($formState->getValue('path')[0]['value'], '/')) {
                $formState->setErrorByName(
                    'path',
                    $this->t('Path must start with a "/".')
                );
            }

            $otherPages = $this->entityTypeManager->getStorage('ekino_rendr_page')->loadByProperties([
                'path' => $formState->getValue('path')[0]['value'],
            ]);

            $channels = \array_map(static function ($channel) {
                if (\is_array($channel)) {
                    return $channel['target_id'];
                }
            }, $formState->getValue('channels'));

            foreach ($otherPages as $otherPage) {
                $otherChannels = \array_map(static function ($otherChannel) {
                    return $otherChannel->id();
                }, $otherPage->get('channels')->referencedEntities());

                if ($otherPage->id() !== $this->entity->id() && !empty(\array_intersect($channels, $otherChannels))) {
                    $formState->setErrorByName(
                        'path',
                        $this->t('Path must be unique per channel. The page "%title" is also using the path "%path".', [
                            '%title' => $otherPage->getTitle(),
                            '%path' => $otherPage->getPath(),
                        ]));
                    break;
                }
            }
        }

        // Url Alias consistancy
        if (!empty($formState->getValue('url_alias')[0]['value'])) {
            $path = $formState->getValue('path')[0]['value'] ?: '';
            $urlAlias = $formState->getValue('url_alias')[0]['value'] ?: '';
            \preg_match('/(:.+)$/', $path, $pathMatches);
            \preg_match('/(:.+)$/', $urlAlias, $urlAliasMatches);

            $pathIsInvalid = 2 === \count($urlAliasMatches) && (2 !== \count($pathMatches) || $urlAliasMatches[1] !== $pathMatches[1]);
            $urlAliasIsInvalid = 2 === \count($pathMatches) && (2 !== \count($urlAliasMatches) || $urlAliasMatches[1] !== $pathMatches[1]);

            // Page must have a path
            if (empty($path)) {
                $formState->setErrorByName(
                    'path',
                    $this->t('Path must be set if you are using Url Alias.')
                );
            } elseif ($pathIsInvalid || $urlAliasIsInvalid) {
                $formState->setErrorByName(
                    'path',
                    $this->t('There is a mismatch between path and Url Alis. In "%field", you are referencing a dynamic content "%key" that has no match in "%reciprocal".', [
                        '%field' => $pathIsInvalid ? 'Url Alias' : 'Path',
                        '%key' => $pathIsInvalid ? $urlAliasMatches[1] : $pathMatches[1],
                        '%reciprocal' => $pathIsInvalid ? 'Path' : 'Url Alias',
                    ])
                );
            }
        }

        // Container inheritance
        $inheritedContainers = $this->getInheritedContainerValues($formState);

        if (!empty($inheritedContainers) && empty($formState->getValue('parent_page')[0]['target_id'])) {
            $formState->setErrorByName(
                'parent_page',
                $this->t('You must select a parent page to enable inheritance.')
            );
        }

        // Parent cyclic reference
        if (!empty($formState->getValue('parent_page')[0]['target_id']) && $this->entity->id()) {
            $parentPage = $this->entityTypeManager->getStorage('ekino_rendr_page')->load($formState->getValue('parent_page')[0]['target_id']);

            while ($parentPage) {
                $entities = $parentPage->get('parent_page')->referencedEntities();
                $parentPage = \reset($entities);

                if ($parentPage && $parentPage->id() === $this->entity->id()) {
                    $formState->setErrorByName(
                        'parent_page',
                        $this->t(
                            'Cyclic Reference error. You cannot assign page %title as parent since it is already a child of the current page',
                            ['%title' => $parentPage->get('title')->value]
                        )
                    );
                    break;
                }
            }
        }

        parent::validateForm($form, $formState);
    }

    /**
     * {@inheritdoc}
     */
    public function save(array $form, FormStateInterface $formState)
    {
        $inheritedContainers = $this->getInheritedContainerValues($formState);

        $this->entity->set('container_inheritance', \implode(',', $inheritedContainers));
        $this->entity->setNewRevision(true);
        $this->entity->setRevisionCreationTime($this->time->getRequestTime());
        $this->entity->setRevisionUserId($this->currentUser ? $this->currentUser->id() : 1);

        $result = parent::save($form, $formState);

        switch ($result) {
            case SAVED_NEW:
                $message = 'The "%label%" page was created.';

                break;
            case SAVED_UPDATED:
                $message = 'The <a href="'.$this->entity->toUrl('edit-form')->toString().'">"%label%"</a> page was updated.';

                break;
            default:
                throw new \LogicException();
        }
        \Drupal::logger('content')->notice(
            "%username has updated the page <a href='@url'>%label</a>.",
            [
                '%username' => \Drupal::currentUser()->getAccountName(),
                '@url' => $this->entity->toUrl('edit-form')->toString(),
                '%label' => $this->entity->label(),
            ]
        );

        $this->messenger->addStatus($this->stringTranslation->translate($message, [
            '%label%' => $this->entity->label(),
        ]));

        $formState->setRedirectUrl($this->entity->toUrl('edit-form'));

        return $result;
    }

    private function getInheritedContainerValues(FormStateInterface $formState)
    {
        $inheritedContainers = [];

        foreach ($formState->getValues() as $key => $value) {
            if (\preg_match('/^(.*)_container_inheritance$/', $key, $matches) && 1 === $value) {
                $inheritedContainers[] = \trim($matches[1]);
            }
        }

        return $inheritedContainers;
    }

    private function generatePreviewUrlsTable(UserInterface $user)
    {
        if (empty($this->entity->getDefaultPath())) {
            return '';
        }

        if ($this->entity->isDynamic()) {
            return '<h4>Preview Urls</h4><div class="description">Dynamic pages have no preview url.</div>';
        }

        $rows = [];

        foreach ($this->entity->get('channels')->referencedEntities() as $channel) {
            $hasMatchingLanguage = \array_key_exists($this->entity->language()->getId(), $channel->getTranslationLanguages(true));
            $translation = $hasMatchingLanguage ? $channel->getTranslation($this->entity->language()->getId()) : $channel;
            $event = new UrlEvent(
                'ekino_rendr.api.catchall_preview',
                [
                    'path' => UrlGenerator::generatePublicPageUrl($this->entity->getDefaultPath(), $translation, [], ['base_url' => '']),
                    'channel' => $translation->id(),
                    '_preview_token' => $user->get('field_rendr_preview_token')->value,
                ],
                [],
                $translation,
                ['page' => $this->entity]
            );

            $this->eventDispatcher->dispatch(UrlEvent::PAGE_URL_EVENT, $event);

            if (!$event->getRouteName() && !$event->getUrl()) {
                continue;
            }

            $rows[] = [
                $event->getChannel() ? $event->getChannel()->label() : $this->entity->language()->getId(),
                $event->getUrl() ?: (new Url($event->getRouteName(), $event->getRouteParameters(), $event->getOptions()))->toString(),
            ];
        }

        return PageFormTemplate::getPreviewTable($rows);
    }
}
