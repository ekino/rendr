<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\paragraphs\Entity\Paragraph;

interface ParagraphNormalizerInterface
{
    /**
     * @param Paragraph $object  The Paragrah object
     * @param string    $format  The output format key
     * @param array     $context The context to apply to this transformation
     *
     * @return array
     */
    public function normalize(Paragraph $object, $format = null, array $context = []);

    /**
     * @return bool
     */
    public function supportsNormalization(Paragraph $object);
}
