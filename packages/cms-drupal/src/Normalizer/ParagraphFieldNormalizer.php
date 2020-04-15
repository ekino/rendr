<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\serialization\Normalizer\EntityReferenceFieldItemNormalizer;

/**
 * Paragraph normalizer.
 */
class ParagraphFieldNormalizer extends EntityReferenceFieldItemNormalizer
{
    protected $format = 'rendr_json';

    /**
     * @var ParagraphNormalizerInterface[]
     */
    protected $normalizers = [];

    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        $values = parent::normalize($object, $format, $context);

        if ('paragraph' !== $values['target_type']) {
            return $values;
        }

        $paragraph = $object->get('entity')->getValue();
        $normalizers = $this->normalizers;

        $normalizeParagraphs = function ($internalParagraph, $internalFormat, $internalContext) use ($normalizers) {
            foreach ($normalizers as $normalizer) {
                if ($normalizer->supportsNormalization($internalParagraph)) {
                    return $normalizer->normalize($internalParagraph, $internalFormat, $internalContext);
                }
            }

            return null;
        };
        $extendedContext = $context + [
                'serializer' => $this->serializer,
                'paragraph_normalizer_closure' => $normalizeParagraphs,
            ];

        $result = $normalizeParagraphs($paragraph, $format, $extendedContext);

        return !empty($result) ? $result : $values;
    }

    /**
     * @param ParagraphNormalizerInterface $normalizer Custom paragraph type normalizers
     */
    public function addNormalizer(ParagraphNormalizerInterface $normalizer)
    {
        $this->normalizers[] = $normalizer;
    }
}
