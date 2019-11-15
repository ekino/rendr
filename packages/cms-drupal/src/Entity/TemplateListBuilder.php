<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\ekino_rendr\Model\Container;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class TemplateListBuilder extends ConfigEntityListBuilder
{
    protected $stringTranslation;

    /**
     * {@inheritdoc}
     */
    public function __construct(EntityTypeInterface $entityType, EntityStorageInterface $storage, TranslationInterface $translation)
    {
        parent::__construct($entityType, $storage);

        $this->stringTranslation = $translation;
    }

    /**
     * {@inheritdoc}
     */
    public static function createInstance(ContainerInterface $container, EntityTypeInterface $entityType): self
    {
        return new self(
            $entityType,
            $container->get('entity_type.manager')->getStorage($entityType->id()),
            $container->get('string_translation')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function buildHeader(): array
    {
        return [
            'id' => $this->stringTranslation->translate('Machine name'),
            'label' => $this->stringTranslation->translate('Label'),
            'containers' => $this->stringTranslation->translate('Containers'),
        ] + parent::buildHeader();
    }

    /**
     * {@inheritdoc}
     *
     * @param Template $entity
     */
    public function buildRow(EntityInterface $entity): array
    {
        return [
            'id' => $entity->id(),
            'label' => $entity->label(),
            'containers' => [
                'data' => [
                    '#theme' => 'item_list',
                    '#items' => \array_map(static function (Container $container): string {
                        return $container->getLabel();
                    }, $entity->getContainers()),
                ],
            ],
        ] + parent::buildRow($entity);
    }
}
