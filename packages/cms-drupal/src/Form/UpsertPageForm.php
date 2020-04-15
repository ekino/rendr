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
        // Path unicity
        if (!empty($formState->getValue('path')[0]['value'])) {
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
                            '%title' => $otherPage->get('title')->value,
                            '%path' => $otherPage->get('path')->value,
                        ]));
                    break;
                }
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
                $parentPage = \reset($parentPage->get('parent_page')->referencedEntities());

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
}
