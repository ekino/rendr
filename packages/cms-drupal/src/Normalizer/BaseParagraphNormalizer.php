<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\paragraphs\ParagraphInterface;

abstract class BaseParagraphNormalizer implements ParagraphNormalizerInterface
{
    /**
     * @var string The supported paragraph type
     */
    protected $supportedParagraphType;

    /**
     * Constructs a ParagraphTransformer object.
     *
     * @param string $supported_paragraph_type The supported paragraph type
     */
    public function __construct($supported_paragraph_type)
    {
        $this->supportedParagraphType = $supported_paragraph_type;
    }

    /**
     * {@inheritdoc}
     */
    abstract public function normalize(ParagraphInterface $object, $format = null, array $context = []);

    /**
     * {@inheritdoc}
     */
    final public function supportsNormalization(ParagraphInterface $object)
    {
        return $object->getType() === $this->supportedParagraphType;
    }
}
