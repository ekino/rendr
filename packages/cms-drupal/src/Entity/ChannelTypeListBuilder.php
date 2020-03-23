<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class ChannelTypeListBuilder extends ConfigEntityListBuilder
{
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
            'id' => $this->t('Machine name'),
            'label' => $this->t('Label'),
        ] + parent::buildHeader();
    }

    /**
     * {@inheritdoc}
     */
    public function buildRow(EntityInterface $entity): array
    {
        return [
            'id' => $entity->id(),
            'label' => $entity->label(),
        ] + parent::buildRow($entity);
    }
}
