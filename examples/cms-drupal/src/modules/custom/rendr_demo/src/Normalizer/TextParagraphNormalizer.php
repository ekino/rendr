<?php

declare(strict_types=1);

namespace Drupal\rendr_demo\Normalizer;

use Drupal\ekino_rendr\Normalizer\BaseParagraphNormalizer;
use Drupal\ekino_rendr\Tool\PreviewHelper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Text Paragraph transformer.
 */
class TextParagraphNormalizer extends BaseParagraphNormalizer
{
    /**
     * {@inheritdoc}
     */
    public function normalize(Paragraph $object, $format = null, array $context = [])
    {
        return [
            'id' => $object->get('id')->value,
            'type' => 'rendr.text',
            'extra' => [
              'preview' => $context['preview'],
              'internal_preview_link' => $context['preview'] ? PreviewHelper::convertToPreviewUrl('/some/url/here') : '',
            ],
            'settings' => [
                'title' => $object->get('field_rendr_title')->value,
                'contents' => $object->get('field_rendr_description')->value,
                'image' => $object->get('field_rendr_image')->value,
            ],
        ];
    }
}
