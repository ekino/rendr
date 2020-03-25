<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class PageListBuilder extends EntityListBuilder
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
                'title' => $this->t('Title'),
                'path' => $this->t('Path'),
                'channels' => $this->t('Channels'),
            ] + parent::buildHeader();
    }

    /**
     * {@inheritdoc}
     *
     * @param Page
     */
    public function buildRow(EntityInterface $entity): array
    {
        return [
                'id' => $entity->id(),
                'title' => $entity->label(),
                'path' => $entity->getPath(),
                'channels' => \implode(', ', \array_map(function ($entity) {
                    return $entity->label();
                }, $entity->get('channels')->referencedEntities())),
            ] + parent::buildRow($entity);
    }
}
