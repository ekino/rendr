<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Tool;

use Drupal\Core\Url;
use Drupal\ekino_rendr\Router\RouterSubscriber;

class UrlGenerator
{
    public static function generatePublicPageUrl($path, $channel, $arguments = [], $options = [])
    {
        if ('route:<nolink>' == $path || '<nolink>' == $path) { // check how to solve this issue.
            return '#';
        }

        if ('route:<front>' == $path || '<front>' == $path) {
            $path = '/';
        }

        if ('https://' == \substr($path, 0, 8)) {
            return $path;
        }

        if ('http://' == \substr($path, 0, 7)) {
            return $path;
        }

        $url = '/'.\trim($path ?? '', '/');
        $request = \Drupal::request();

        if ($request->get('_preview_token') && $request->get('_preview')) {
            $arguments['_preview_token'] = $request->get('_preview_token');
            $arguments['_preview'] = $request->get('_preview');
        }

        $parsedUrl = \parse_url($url);

        if (\count($arguments) > 0) {
            $parsedUrl['query'] = (\array_key_exists('query', $parsedUrl) ? '&' : '').\http_build_query($arguments);
        }

        return self::unparseUrl($parsedUrl);
    }

    public static function generatePublicContentUrl($content, $channel, $arguments = [], $options = [])
    {
        $routeName = \sprintf('%s_rendr_dynamic_%s_%s', $channel->get('id')->value, $content->bundle(), $content->get('langcode')->value);
        $request = \Drupal::request();
        $arguments += [
            'slug' => $content->get('field_slug')->value,
        ];

        if (!\array_key_exists('_preview_token', $arguments) && !\array_key_exists('_preview', $arguments) &&
            $request->get('_preview_token') && $request->get('_preview')) {
            $arguments['_preview_token'] = $request->get('_preview_token');
            $arguments['_preview'] = $request->get('_preview');
        }

        try {
            $url = Url::fromRoute($routeName, $arguments, \array_merge([
                    'scheme' => 'route',
                ], $options)
            )->toString();

            $url = \str_replace(RouterSubscriber::VIEW_BASE_URL, '', $url);

            // remove the language from the url, we assume the language detection is the path
            $addedPath = '/'.$channel->language()->getId().'/';

            if (\substr($url, 0, \strlen($addedPath)) == $addedPath) {
                $url = \substr($url, \strlen($addedPath) - 1);
            }

            $url = self::getBaseUrl($channel, $options).$url;
        } catch (\Exception $e) {
            \Drupal::logger('ekino_rendr')->error('Error while generating route "@route".<br/>@message<br/>@stack_trace', [
                '@route' => $routeName,
                '@message' => $e->getMessage(),
                '@stack_trace' => $e->getTraceAsString(),
            ]);
            $url = '/error-page-link';
        }

        return $url;
    }

    public static function getBaseUrl($channel, $options = [])
    {
        $protocol = !empty($options['https']) ? 'https' : 'http';
        $domain = '';

        if (\array_key_exists('base_url', $options)) {
            $domain = $options['base_url'];
        } elseif (!empty($channel->get('domain')->value)) {
            $domain = $channel->get('domain')->value;
        }

        if (empty($domain)) {
            return '';
        }

        $addProtocol = 0 === \strpos($domain, 'http');

        return $addProtocol ? \sprintf('%s://%s', $protocol, $domain) : $domain;
    }

    public static function unparseUrl($parsedUrl)
    {
        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'].'://' : '';
        $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
        $port = isset($parsedUrl['port']) ? ':'.$parsedUrl['port'] : '';
        $user = isset($parsedUrl['user']) ? $parsedUrl['user'] : '';
        $pass = isset($parsedUrl['pass']) ? ':'.$parsedUrl['pass'] : '';
        $pass = ($user || $pass) ? "$pass@" : '';
        $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
        $query = isset($parsedUrl['query']) ? '?'.$parsedUrl['query'] : '';
        $fragment = isset($parsedUrl['fragment']) ? '#'.$parsedUrl['fragment'] : '';

        return $scheme.$user.$pass.$host.$port.$path.$query.$fragment;
    }
}
