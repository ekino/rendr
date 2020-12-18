<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\ekino_rendr\Entity\PageInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a form for reverting a page revision.
 *
 * @internal
 */
class PageRevisionRevertForm extends ConfirmFormBase
{
    /***
     * @var PageInterface
     */
    protected $revision;

    /**
     * The page storage.
     *
     * @var EntityStorageInterface
     */
    protected $pageStorage;

    /**
     * The date formatter service.
     *
     * @var \Drupal\Core\Datetime\DateFormatterInterface
     */
    protected $dateFormatter;

    /**
     * The time service.
     *
     * @var \Drupal\Component\Datetime\TimeInterface
     */
    protected $time;

    /**
     * Constructs a new PageRevisionRevertForm.
     *
     * @param \Drupal\Core\Entity\EntityStorageInterface   $pageStorage
     *                                                                    The page storage
     * @param \Drupal\Core\Datetime\DateFormatterInterface $dateFormatter
     *                                                                    The date formatter service
     * @param \Drupal\Component\Datetime\TimeInterface     $time
     *                                                                    The time service
     */
    public function __construct(EntityStorageInterface $pageStorage, DateFormatterInterface $dateFormatter, TimeInterface $time)
    {
        $this->pageStorage = $pageStorage;
        $this->dateFormatter = $dateFormatter;
        $this->time = $time;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('entity_type.manager')->getStorage('ekino_rendr_page'),
            $container->get('date.formatter'),
            $container->get('datetime.time')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'ekino_rendr_page_revision_revert_confirm';
    }

    /**
     * {@inheritdoc}
     */
    public function getQuestion()
    {
        return \t('Are you sure you want to revert to the revision from %revision-date?', ['%revision-date' => $this->dateFormatter->format($this->revision->get('revision_created')->value)]);
    }

    /**
     * {@inheritdoc}
     */
    public function getCancelUrl()
    {
        return new Url('entity.ekino_rendr_page.version_history', ['ekino_rendr_page' => $this->revision->id()]);
    }

    /**
     * {@inheritdoc}
     */
    public function getConfirmText()
    {
        return \t('Revert');
    }

    /**
     * {@inheritdoc}
     */
    public function getDescription()
    {
        return '';
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
        // The revision timestamp will be updated when the revision is saved. Keep
        // the original one for the confirmation message.
        $original_revision_timestamp = $this->revision->getRevisionCreationTime();

        $this->revision = $this->prepareRevertedRevision($this->revision, $form_state);
        $this->revision->setRevisionLogMessage(\t('Copy of the revision from %date.', ['%date' => $this->dateFormatter->format($original_revision_timestamp)]));
        $this->revision->setRevisionUserId($this->currentUser()->id());
        $this->revision->setRevisionCreationTime($this->time->getRequestTime());
        $this->revision->setChangedTime($this->time->getRequestTime());
        $this->revision->save();

        $this->logger('content')->notice('@type: reverted %title revision %revision.', ['@type' => $this->revision->bundle(), '%title' => $this->revision->label(), '%revision' => $this->revision->getRevisionId()]);
        $this->messenger()
            ->addStatus($this->t('Page %title has been reverted to the revision from %revision-date.', [
                '%title' => $this->revision->label(),
                '%revision-date' => $this->dateFormatter->format($original_revision_timestamp),
            ]));
        $form_state->setRedirect(
            'entity.ekino_rendr_page.version_history',
            ['ekino_rendr_page' => $this->revision->id()]
        );
    }

    /**
     * Prepares a revision to be reverted.
     *
     * @param PageInterface      $revision
     *                                       The revision to be reverted
     * @param formStateInterface $form_state
     *                                       The current state of the form
     *
     * @return pageInterface
     *                       The prepared revision ready to be stored
     */
    protected function prepareRevertedRevision(PageInterface $revision, FormStateInterface $form_state)
    {
        $revision->setNewRevision();
        $revision->isDefaultRevision(true);

        return $revision;
    }
}
