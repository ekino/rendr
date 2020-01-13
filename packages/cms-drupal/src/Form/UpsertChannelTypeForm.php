<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\BundleEntityFormBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\ekino_rendr\Entity\ChannelType;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class UpsertChannelTypeForm extends BundleEntityFormBase
{
    protected $channelTypeStorage;
    protected $messenger;
    protected $stringTranslation;

    public function __construct(EntityStorageInterface $entityStorage, MessengerInterface $messenger, TranslationInterface $translation)
    {
        $this->channelTypeStorage = $entityStorage;
        $this->messenger = $messenger;
        $this->stringTranslation = $translation;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container): self
    {
        return new self(
            $container->get('entity_type.manager')->getStorage(ChannelType::ID),
            $container->get('messenger'),
            $container->get('string_translation')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function form(array $form, FormStateInterface $formState): array
    {
        return [
            'id' => [
                '#type' => 'machine_name',
                '#title' => $this->stringTranslation->translate('Machine name'),
                '#required' => true,
                '#default_value' => $this->entity->id(),
                '#disabled' => !$this->entity->isNew(),
                '#machine_name' => [
                    'exists' => [$this->channelTypeStorage, 'load'],
                ],
            ],
            'label' => [
                '#type' => 'textfield',
                '#title' => $this->stringTranslation->translate('Label'),
                '#required' => true,
                '#default_value' => $this->entity->label(),
                '#id' => 'ekino_rendr_channel_type_label',
            ],
        ] + parent::form($form, $formState);
    }

    /**
     * {@inheritdoc}
     */
    public function save(array $form, FormStateInterface $formState): int
    {
        $result = parent::save($form, $formState);

        switch ($result) {
            case SAVED_NEW:
                $message = 'The "%label%" channel type was created.';

                break;
            case SAVED_UPDATED:
                $message = 'The "%label%" channel type was updated.';

                break;
            default:
                throw new \LogicException();
        }

        $this->messenger->addStatus($this->stringTranslation->translate($message, [
            '%label%' => $this->entity->label(),
        ]));

        $formState->setRedirectUrl($this->entity->toUrl('edit-form'));

        return $result;
    }
}
