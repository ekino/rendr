<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\ekino_rendr\Transformer\ParagraphTransformerInterface;
use Drupal\serialization\Normalizer\ContentEntityNormalizer;

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

        $attributes['head']['title'] = $object->get('title')->value;
        $attributes['path'] = $object->get('path')->value;
        $attributes['blocks'] = $data['content'];

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
}
