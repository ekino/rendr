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
        $slug = $string;
        $slug = \str_replace(['Á', 'Â', 'À', 'Ä', 'á', 'â', 'à', 'ä'], 'a', $slug);
        $slug = \str_replace(['É', 'Ê', 'È', 'Ë', 'é', 'ê', 'è', 'ë'], 'e', $slug);
        $slug = \str_replace(['Í', 'Î', 'Ì', 'Ï', 'í', 'î', 'ì', 'ï'], 'i', $slug);
        $slug = \str_replace(['Ó', 'Ô', 'Ò', 'Ö', 'ó', 'ô', 'ò', 'ö'], 'o', $slug);
        $slug = \str_replace(['Ú', 'Û', 'Ù', 'Ü', 'ú', 'û', 'ù', 'ü'], 'u', $slug);
        $slug = \str_replace(['ñ', 'ç'], ['n', 'c'], $slug);
        $slug = \strtolower($slug);
        $slug = \preg_replace('/[^a-zA-Z0-9-]+/', '-', $slug);

        return \trim(\preg_replace('/(-{2,})/', '-', $slug), '-');
    }
}
