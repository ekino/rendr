<?php

declare(strict_types=1);

namespace Drupal\rendr_demo\Normalizer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Normalizer\BaseParagraphNormalizer;
use Drupal\paragraphs\ParagraphInterface;

/**
 * Text Paragraph transformer.
 */
class ContentParagraphNormalizer extends BaseParagraphNormalizer
{
    /**
     * @var EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    /**
     * {@inheritdoc}
     */
    public function __construct($supported_paragraph_type)
    {
        parent::__construct($supported_paragraph_type);
    }
    /**
     * {@inheritdoc}
     */
    public function normalize(ParagraphInterface $object, $format = null, array $context = [])
    {
        $node = $context['content'];

        if (!$node) {
            return [];
        }

        return [
            'id' => $object->id(),
            'type' => 'rendr.content',
            'settings' => [
                'title' => $node->label(),
                'contents' => $node->get('body')->value,
            ],
        ];
    }
}
