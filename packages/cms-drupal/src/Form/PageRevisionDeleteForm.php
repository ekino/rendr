<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\ekino_rendr\Entity\PageInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a form for deleting a page revision.
 *
 * @internal
 */
class PageRevisionDeleteForm extends ConfirmFormBase
{
    /**
     * The page revision.
     *
     * @var PageInterface
     */
    protected $revision;

    /**
     * The page storage.
     *
     * @var \Drupal\Core\Entity\EntityStorageInterface
     */
    protected $pageStorage;

    /**
     * The date formatter service.
     *
     * @var \Drupal\Core\Datetime\DateFormatterInterface
     */
    protected $dateFormatter;

    /**
     * Constructs a new PageRevisionDeleteForm.
     *
     * @param \Drupal\Core\Entity\EntityStorageInterface   $pageStorage
     *                                                                     The page storage
     * @param \Drupal\Core\Datetime\DateFormatterInterface $date_formatter
     *                                                                     The date formatter service
     */
    public function __construct(EntityStorageInterface $pageStorage, DateFormatterInterface $dateFormatter)
    {
        $this->pageStorage = $pageStorage;
        $this->dateFormatter = $dateFormatter;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        $entity_type_manager = $container->get('entity_type.manager');

        return new static(
      $entity_type_manager->getStorage('ekino_rendr_page'),
      $container->get('date.formatter')
    );
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'ekino_rendr_page_revision_delete_confirm';
    }

    /**
     * {@inheritdoc}
     */
    public function getQuestion()
    {
        return \t('Are you sure you want to delete the revision from %revision-date?', [
      '%revision-date' => $this->dateFormatter->format($this->revision->getRevisionCreationTime()),
    ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getCancelUrl()
    {
        return new Url('entity.ekino_rendr_page.version_history', [
        'ekino_rendr_page' => $this->revision->id(),
    ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getConfirmText()
    {
        return \t('Delete');
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state, $page_revision = null)
    {
        $this->revision = $this->pageStorage->loadRevision($page_revision);
        $form = parent::buildForm($form, $form_state);

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $this->pageStorage->deleteRevision($this->revision->getRevisionId());

        $this->logger('ekino_rendr_page')
        ->notice('Page deleted: %title revision %revision.', [
            '%title' => $this->revision->label(), '%revision' => $this->revision->getRevisionId(),
        ]);
        $this->messenger()
      ->addStatus($this->t('Revision from %revision-date of page %title has been deleted.', [
        '%revision-date' => $this->dateFormatter->format($this->revision->getRevisionCreationTime()),
        '%title' => $this->revision->label(),
      ]));
        $form_state->setRedirect(
      'entity.ekino_rendr_page.version_history',
      ['ekino_rendr_page' => $this->revision->id()]
    );
    }
}
