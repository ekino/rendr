<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\serialization\Normalizer\EntityReferenceFieldItemNormalizer;

/**
 * Paragraph normalizer.
 */
class ParagraphFieldNormalizer extends EntityReferenceFieldItemNormalizer
{
    /**
     * @var ParagraphTransformerInterface[]
     */
    protected $normalizers = [];

    /**
     * Constructs a ParagraphNormalizer object.
     *
     * @param string|array $format The supported format
     */
    public function __construct($format)
    {
        $this->format = $format;
    }

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
        $extendedContext = $context + ['serializer' => $this->serializer];

        foreach ($this->normalizers as $normalizer) {
            if ($normalizer->supportsNormalization($paragraph)) {
                return $normalizer->normalize($paragraph, $format, $extendedContext);
            }
        }

        return $values;
    }

    /**
     * @param ParagraphNormalizerInterface $normalizer Custom paragraph type normalizers
     */
    public function addNormalizer(ParagraphNormalizerInterface $normalizer)
    {
        $this->normalizers[] = $normalizer;
    }
}
