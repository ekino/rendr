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
use Drupal\ekino_rendr\Entity\Page;
use Drupal\ekino_rendr\Entity\Template;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class UpsertPageForm extends ContentEntityForm
{
    protected $messenger;
    protected $stringTranslation;
    protected $dateFormatter;
    protected $currentUser;
    protected $entityTypeManager;

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
        EntityTypeBundleInfoInterface $entityTypeBundleInfo = null,
        TimeInterface $time = null
    ) {
        parent::__construct($entityRepository, $entityTypeBundleInfo, $time);
        $this->messenger = $messenger;
        $this->stringTranslation = $translation;
        $this->dateFormatter = $dateFormatter;
        $this->currentUser = $accountProxy;
        $this->entityTypeManager = $entityTypeManager;
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

        $form = parent::form($form, $formState) + [
                'rendr_containers' => [
                    '#type' => 'vertical_tabs',
                    '#weight' => 2,
                ],
            ];

        $form['publication_section'] = [
            '#type' => 'details',
            '#title' => $this
                ->t('Publication & Channels'),
            '#group' => 'rendr_containers',
            '#weight' => 99, // high weight so this tab is rendered last
        ];
        $form['publication_section']['channels'] = $form['channels'];
        $form['publication_section'][$entityType->getKey('published')] = $form[$entityType->getKey('published')];

        unset($form['channels']);
        unset($form[$entityType->getKey('published')]);

        foreach (\array_keys($form) as $fieldKey) {
            if (\preg_match(Template::CONTAINER_KEY_PATTERN, $fieldKey, $matches)) {
                $form[$matches[1].'_section'] = [
                    '#type' => 'details',
                    '#title' => $this
                        ->t(\str_replace('_', ' ', $matches[1])),
                    '#weight' => $form[$fieldKey]['#weight'] ?? 0,
                    '#group' => 'rendr_containers',
                ];

                $form[$matches[1].'_section'][$fieldKey] = $form[$fieldKey];
                unset($form[$fieldKey]);
            }
        }

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function save(array $form, FormStateInterface $formState)
    {
        $this->entity->setNewRevision(true);
        $this->entity->setRevisionCreationTime($this->time->getRequestTime());
        $this->entity->setRevisionUserId($this->currentUser ? $this->currentUser->id() : 1);

        $result = parent::save($form, $formState);

        switch ($result) {
            case SAVED_NEW:
                $message = 'The "%label%" page was created.';

                break;
            case SAVED_UPDATED:
                $message = 'The "%label%" page was updated.';

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
