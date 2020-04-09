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
    /**
     * {@inheritdoc}
     */
    public function buildHeader(): array
    {
        return [
            'id' => $this->t('Machine name'),
            'label' => $this->t('Label'),
            'containers' => $this->t('Containers'),
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
