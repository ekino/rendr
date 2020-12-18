<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\ekino_rendr\Entity\PageInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a form for reverting a page revision for a single translation.
 *
 * @internal
 */
class PageRevisionRevertTranslationForm extends PageRevisionRevertForm
{
    /**
     * The language to be reverted.
     *
     * @var string
     */
    protected $langcode;

    /**
     * The language manager.
     *
     * @var \Drupal\Core\Language\LanguageManagerInterface
     */
    protected $languageManager;

    /**
     * Constructs a new PageRevisionRevertTranslationForm.
     *
     * @param \Drupal\Core\Entity\EntityStorageInterface     $pageStorage
     *                                                                        The page storage
     * @param \Drupal\Core\Datetime\DateFormatterInterface   $dateFormatter
     *                                                                        The date formatter service
     * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
     *                                                                        The language manager
     * @param \Drupal\Component\Datetime\TimeInterface       $time
     *                                                                        The time service
     */
    public function __construct(EntityStorageInterface $pageStorage, DateFormatterInterface $dateFormatter, LanguageManagerInterface $languageManager, TimeInterface $time)
    {
        parent::__construct($pageStorage, $dateFormatter, $time);
        $this->languageManager = $languageManager;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('entity_type.manager')->getStorage('ekino_rendr_page'),
            $container->get('date.formatter'),
            $container->get('language_manager'),
            $container->get('datetime.time')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'ekino_rendr_page_revision_revert_translation_confirm';
    }

    /**
     * {@inheritdoc}
     */
    public function getQuestion()
    {
        return \t('Are you sure you want to revert @language translation to the revision from %revision-date?', ['@language' => $this->languageManager->getLanguageName($this->langcode), '%revision-date' => $this->dateFormatter->format($this->revision->getRevisionCreationTime())]);
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
    public function buildForm(array $form, FormStateInterface $form_state, $node_revision = null, $langcode = null)
    {
        $this->langcode = $langcode;
        $form = parent::buildForm($form, $form_state, $node_revision);
        $form['revert_untranslated_fields'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('Revert content shared among translations'),
            '#default_value' => $this->revision->getTranslation($this->langcode)->isDefaultTranslation(),
            '#access' => true,
        ];

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    protected function prepareRevertedRevision(PageInterface $revision, FormStateInterface $form_state)
    {
        $revert_untranslated_fields = (bool) $form_state->getValue('revert_untranslated_fields');
        $translation = $revision->getTranslation($this->langcode);

        return $this->pageStorage->createRevision($translation, true, $revert_untranslated_fields);
    }
}
