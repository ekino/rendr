<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\ekino_rendr\Entity\Template;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TemplateForm extends EntityForm
{
    protected $templateStorage;
    protected $messenger;
    protected $stringTranslation;

    public function __construct(EntityStorageInterface $entityStorage, MessengerInterface $messenger, TranslationInterface $translation)
    {
        $this->templateStorage = $entityStorage;
        $this->messenger = $messenger;
        $this->stringTranslation = $translation;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container): self
    {
        return new self(
            $container->get('entity_type.manager')->getStorage(Template::ID),
            $container->get('messenger'),
            $container->get('string_translation')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function form(array $form, FormStateInterface $form_state)
    {
        $form = parent::form($form, $form_state);
        $pageTemplate = $this->entity;

        $form['label'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Label'),
            '#maxlength' => 255,
            '#default_value' => $pageTemplate->label(),
            '#description' => $this->t('Name of the page template'),
            '#required' => true,
        ];
        $form['id'] = [
            '#type' => 'machine_name',
            '#default_value' => $pageTemplate->id(),
            '#machine_name' => [
                'exists' => [$this->templateStorage, 'load'],
            ],
            '#disabled' => !$pageTemplate->isNew(),
        ];

        return $form;
    }

    public function save(array $form, FormStateInterface $form_state)
    {
        $result = parent::save($form, $form_state);
        $form_state->setRedirectUrl($this->entity->toUrl('collection'));

        return $result;
    }
}
