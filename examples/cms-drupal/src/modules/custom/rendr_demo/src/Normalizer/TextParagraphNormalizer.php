<?php

declare(strict_types=1);

namespace Drupal\rendr_demo\Normalizer;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\ekino_rendr\Normalizer\BaseParagraphNormalizer;
use Drupal\ekino_rendr\Tool\PreviewHelper;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\ParagraphInterface;

/**
 * Text Paragraph transformer.
 */
class TextParagraphNormalizer extends BaseParagraphNormalizer
{
    /**
     * {@inheritdoc}
     */
    public function normalize(ParagraphInterface $object, $format = null, array $context = [])
    {
        return [
            'id' => $object->id(),
            'type' => 'rendr.text',
            'settings' => [
                'title' => $object->get('field_rendr_title')->value,
                'contents' => $object->get('field_rendr_description')->value,
                'image' => $this->formatImage($object->get('field_rendr_image')),
            ],
        ];
    }

    private function formatImage(FieldItemListInterface $fieldItemList)
    {
        $fieldValue = $fieldItemList->getValue();

        if (!isset($fieldValue[0])) {
            return null;
        }

        return [
            'src' => $fieldItemList->entity->getFileUri(),
            'alt' => $fieldValue[0]['alt'],
            'width' => $fieldValue[0]['width'],
            'height' => $fieldValue[0]['height'],
        ];
    }
}
