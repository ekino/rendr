<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\ekino_rendr\Entity\Channel;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class ChannelUpsertForm extends ContentEntityForm
{
    protected $messenger;
    protected $stringTranslation;
    protected $dateFormatter;
    protected $currentUser;

    /**
     * {@inheritdoc}
     */
    public function __construct(
        EntityRepositoryInterface $entityRepository,
        MessengerInterface $messenger,
        TranslationInterface $translation,
        DateFormatterInterface $dateFormatter,
        AccountProxyInterface $accountProxy,
        EntityTypeBundleInfoInterface $entityTypeBundleInfo = null,
        TimeInterface $time = null
    ) {
        parent::__construct($entityRepository, $entityTypeBundleInfo, $time);

        $this->messenger = $messenger;
        $this->stringTranslation = $translation;
        $this->dateFormatter = $dateFormatter;
        $this->currentUser = $accountProxy;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container): self
    {
        return new self(
            $container->get('entity.repository'),
            $container->get('messenger'),
            $container->get('string_translation'),
            $container->get('date.formatter'),
            $container->get('current_user'),
            $container->get('entity_type.bundle.info'),
            $container->get('datetime.time')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function form(array $form, FormStateInterface $formState): array
    {
        if (!$this->entity instanceof Channel) {
            throw new \LogicException();
        }

        $entityType = $this->entity->getEntityType();
        if (!$entityType instanceof ContentEntityTypeInterface) {
            throw new \LogicException();
        }

        $form = [
                '#theme' => 'node_edit_form',
                '#attached' => [
                    'library' => [
                        'node/form',
                    ],
                ],
                'advanced' => [
                    '#type' => 'container',
                    '#attributes' => [
                        'class' => 'entity-meta',
                    ],
                    'meta' => [
                        '#type' => 'container',
                        '#attributes' => [
                            'class' => 'entity-meta__header',
                        ],
                        'changed' => [
                            '#type' => 'item',
                            '#wrapper_attributes' => [
                                'class' => 'entity-meta__last-saved container-inline',
                            ],
                            '#markup' => \sprintf('<label>%s</label> %s', $this->stringTranslation->translate('Last saved'), $this->entity->isNew() ? $this->stringTranslation->translate('Not saved yet') : $this->dateFormatter->format($this->entity->getChangedTime())),
                            '#allowed_tags' => [
                                'label',
                            ],
                            '#value' => $this->entity->getChangedTime(),
                        ],
                    ],
                ],
            ] + parent::form($form, $formState);

        $form[$entityType->getRevisionMetadataKey('revision_log_message')]['#group'] = 'meta';

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $formState)
    {
        $domain = $formState->getValue('domain')[0]['value'];
        $locale = $formState->getValue('locale')[0]['value'];

        $existingChannels = $this->entityTypeManager->getStorage('ekino_rendr_channel')->loadByProperties([
            'domain' => $domain,
        ]);

        foreach ($existingChannels as $existingChannel) {
            foreach ($existingChannel->getTranslationLanguages(true) as $langcode => $language) {
                $translation = $existingChannel->getTranslation($langcode);

                if ($translation->get('locale')->value === $locale &&
                    ($this->entity->id() !== $translation->id() || $this->entity->language()->getId() !== $translation->language()->getId())
                ) {
                    $formState->setErrorByName(
                        'locale',
                        $this->t('The pair domain + locale must be unique. The channel "%title" is also using the same combination.', [
                            '%title' => $translation->get('label')->value,
                        ]));
                    break 2;
                }
            }
        }

        [$values, $errors] = Channel::extractSettingValues($formState->getValue('public_settings')[0]['value']);

        if (!empty($errors)) {
            $formState->setErrorByName(
                'settings',
                $this->t('Every setting must be in the format key=value. Invalid format at line %line', [
                    '%line' => $errors[0] + 1,
                ]));
        }

        parent::validateForm($form, $formState);
    }

    /**
     * {@inheritdoc}
     */
    public function save(array $form, FormStateInterface $formState): int
    {
        $this->entity->setNewRevision(true);
        $this->entity->setRevisionCreationTime($this->time->getRequestTime());
        $this->entity->setRevisionUserId($this->currentUser->id());

        $result = parent::save($form, $formState);

        switch ($result) {
            case SAVED_NEW:
                $message = 'The "%label%" channel was created.';

                break;
            case SAVED_UPDATED:
                $message = 'The "%label%" channel was updated.';

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
