<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Normalizer;

use Drupal\paragraphs\ParagraphInterface;

interface ParagraphNormalizerInterface
{
    /**
     * @param ParagraphInterface $object  The Paragrah object
     * @param string             $format  The output format key
     * @param array              $context The context to apply to this transformation
     *
     * @return array
     */
    public function normalize(ParagraphInterface $object, $format = null, array $context = []);

    /**
     * @return bool
     */
    public function supportsNormalization(ParagraphInterface $object);
}
