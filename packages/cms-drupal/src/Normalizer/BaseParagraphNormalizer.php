<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\paragraphs\Entity\Paragraph;

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
    abstract public function normalize(Paragraph $object, $format = null, array $context = []);

    /**
     * {@inheritdoc}
     */
    final public function supportsNormalization(Paragraph $object)
    {
        return $object->getType() === $this->supportedParagraphType;
    }
}
