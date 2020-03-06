<?php

declare(strict_types=1);

namespace Drupal\rendr_demo\Normalizer;

use Drupal\ekino_rendr\Normalizer\BaseParagraphNormalizer;
use Drupal\ekino_rendr\Tool\PreviewHelper;

/**
 * Text Paragraph transformer.
 */
class TextParagraphNormalizer extends BaseParagraphNormalizer
{
    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        return [
            'id' => $object->get('id')->value,
            'container' => $object->get('field_rendr_container')->value ?? 'body',
            'type' => 'rendr.text',
            'extra' => [
              'preview' => $context['preview'],
              'internal_preview_link' => $context['preview'] ? PreviewHelper::convertToPreviewUrl('/some/url/here') : '',
            ],
            'settings' => [
                'title' => $object->get('field_rendr_title')->value,
                'subtitle' => $object->get('field_rendr_subtitle')->value,
                'contents' => $object->get('field_rendr_text')->value,
                'mode' => $object->get('field_rendr_display')->value,
                'image' => $object->get('field_rendr_image')->value,
                'image_position' => $object->get('field_rendr_image_position')->value,
            ],
        ];
    }
}
