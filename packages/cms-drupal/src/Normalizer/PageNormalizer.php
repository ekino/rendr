<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\ekino_rendr\Entity\Template;
use Drupal\ekino_rendr\Transformer\ParagraphTransformerInterface;
use Drupal\serialization\Normalizer\ContentEntityNormalizer;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Page normalizer.
 */
class PageNormalizer extends ContentEntityNormalizer
{
    /**
     * @var ParagraphTransformerInterface
     */
    protected $transformers;

    /**
     * Constructs a PageNormalizer object.
     *
     * @param string|array $supported_class The supported class
     * @param string|array $format          The supported format
     */
    public function __construct($supported_class, $format)
    {
        $this->supportedInterfaceOrClass = $supported_class;
        $this->format = $format;
    }

    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        $data = parent::normalize($object, $format, $context);
        $attributes = $this->createPage();
        $containers = \array_filter($data, static function ($key) {
            return \preg_match(Template::CONTAINER_KEY_PATTERN, $key);
        }, ARRAY_FILTER_USE_KEY);
        $blocks = [];

        foreach ($containers as $key => $container) {
            \preg_match(Template::CONTAINER_KEY_PATTERN, $key, $matches);
            $blocks = \array_merge($blocks, \array_map(static function ($block) use ($matches) {
                $block['container'] = $matches[1];

                return $block;
            }, $container));
        }

        $attributes['head']['title'] = $object->get('title')->value;
        $attributes['path'] = $object->get('path')->value;
        $attributes['blocks'] = $blocks;
        $attributes['settings'] = $this->resolve($context);
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
     * Resolve context.
     *
     * @return array
     */
    private function resolve(array $context)
    {
        $resolver = new OptionsResolver();
        $resolver->setDefaults(['preview' => false]);
        $resolver->setDefined(['preview']);

        return $resolver->resolve($context);
    }
}
