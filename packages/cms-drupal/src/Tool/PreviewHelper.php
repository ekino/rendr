<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Tool;

use Symfony\Component\HttpFoundation\Request;

class PreviewHelper
{
    public const PREVIEW_PREFIX = '_preview';

    public static function convertToPreviewUrl(string $uri): string
    {
        $request = Request::create($uri);

        if (false === \strpos($uri, '/'.self::PREVIEW_PREFIX)) {
            return \sprintf(
                '%s%s%s',
                // This is a relative url
                \preg_match('/^https?:\/\//', $uri) ? $request->getSchemeAndHttpHost().'/' : '/',
                self::PREVIEW_PREFIX,
                $request->getRequestUri()
            );
        }

        return $uri;
    }
}
