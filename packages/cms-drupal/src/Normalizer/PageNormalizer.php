<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityTypeRepositoryInterface;
use Drupal\ekino_rendr\Entity\PageInterface;
use Drupal\ekino_rendr\Entity\Template;
use Drupal\serialization\Normalizer\ContentEntityNormalizer;

/**
 * Page normalizer.
 */
class PageNormalizer extends ContentEntityNormalizer
{
    protected $supportedInterfaceOrClass = PageInterface::class;

    protected $format = 'rendr_json';

    protected $entityDisplayRepository;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager,
        EntityDisplayRepositoryInterface $entity_display_repository,
        EntityTypeRepositoryInterface $entity_type_repository = null,
        EntityFieldManagerInterface $entity_field_manager = null
    ) {
        parent::__construct($entity_type_manager, $entity_type_repository, $entity_field_manager);

        $this->entityDisplayRepository = $entity_display_repository;
    }

    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        $object = $this->resolveContainerInheritance($object);
        $data = parent::normalize($object, $format, $context);
        $attributes = $this->createPage();
        $containers = \array_filter($data, static function ($key) {
            return \preg_match(Template::CONTAINER_KEY_PATTERN, $key);
        }, ARRAY_FILTER_USE_KEY);

        $display = $this->entityDisplayRepository->getFormDisplay('ekino_rendr_page', $object->bundle());
        $fieldDefinitions = $display->toArray();
        \uksort($containers, function ($a, $b) use ($object, $fieldDefinitions) {
            return $fieldDefinitions['content'][$a]['weight'] <=> $fieldDefinitions['content'][$b]['weight'];
        });

        $blocks = [];
        $blockOrder = 0;

        foreach ($containers as $key => $container) {
            \preg_match(Template::CONTAINER_KEY_PATTERN, $key, $matches);
            $blocks = \array_merge($blocks, \array_map(static function ($block) use ($matches, &$blockOrder) {
                $block['container'] = $block['container'] ?? $matches[1];
                $block['order'] = $blockOrder;
                ++$blockOrder;

                return $block;
            }, $container));
        }

        $attributes['head']['title'] = $object->get('title')->value;
        $attributes['path'] = $object->get('path')->value;
        $attributes['blocks'] = $blocks;
        $attributes['settings'] = ['preview' => $context['preview'] ?? false];
        $attributes['settings']['published'] = (bool) $object->get('published')->value;

        return $attributes;
    }

    /**
     * Create an array compatible with Rendr page.
     *
     * @return array
     */
    private function createPage()
    {
        return [
            'statusCode' => 200,
            'type' => 'document',
            'template' => 'rendr',
            'cache' => ['ttl' => 0],
            'head' => [
                'titleTemplate' => 'Ekino - %s',
                'defaultTitle' => '-',
                'title' => '-',
                'link' => '',
                'htmlAttributes' => [],
                'meta' => [],
            ],
            'blocks' => [],
            'settings' => [],
            'id' => '',
            'path' => '/',
        ];
    }

    /**
     * Resolve inheritance in containers.
     *
     * @return PageInterface
     */
    private function resolveContainerInheritance(PageInterface $page)
    {
        // Replace
        $inheritedContainers = !empty($page->get('container_inheritance')->getValue()[0]['value']) ?
            \explode(',', $page->get('container_inheritance')->getValue()[0]['value']) :
            [];

        $entities = $page->get('parent_page')->referencedEntities();
        $parentPage = \reset($entities);

        if ($parentPage) {
            $parentPage = $this->resolveContainerInheritance($parentPage);
        }

        foreach ($inheritedContainers as $key) {
            $fieldName = \sprintf(Template::CONTAINER_KEY_FORMAT, $key);

            if ($parentPage->hasField($fieldName)) {
                $page->set($fieldName, $parentPage->get($fieldName)->getValue());
            }
        }

        return $page;
    }
}
