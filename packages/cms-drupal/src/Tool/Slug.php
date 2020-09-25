<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Tool;

class Slug
{
    public static function slugify($string)
    {
        if (!\is_string($string)) {
            return '';
        }

        $slug = \strtolower($string);
        $slug = \str_replace(['á', 'â', 'à', 'ä'], 'a', $slug);
        $slug = \str_replace(['é', 'ê', 'è', 'ë'], 'e', $slug);
        $slug = \str_replace(['í', 'î', 'ì', 'ï'], 'i', $slug);
        $slug = \str_replace(['ó', 'ô', 'ò', 'ö'], 'o', $slug);
        $slug = \str_replace(['ú', 'û', 'ù', 'ü'], 'u', $slug);
        $slug = \str_replace(['ñ', 'ç'], ['n', 'c'], $slug);
        $slug = \preg_replace('/[^a-zA-Z0-9-]+/', '-', $slug);

        return \trim(\preg_replace('/(-{2,})/', '-', $slug), '-');
    }
}
