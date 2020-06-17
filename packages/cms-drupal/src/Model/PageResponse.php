<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Model;

use Symfony\Component\HttpFoundation\JsonResponse;

class PageResponse
{
    const ERROR_404_PAGE = '/error-404';
    const ERROR_500_PAGE = '/error-500';

    /**
     * Create an array compatible with Rendr page.
     *
     * @return array
     */
    public static function createPage()
    {
        return [
            'statusCode' => 200,
            'type' => 'document',
            'template' => 'rendr',
            'cache' => ['ttl' => 0],
            'head' => [
                'titleTemplate' => 'Ekino - %s',
                'defaultTitle' => '-',
                'title' => '-',
                'link' => '',
                'htmlAttributes' => [],
                'meta' => [],
            ],
            'blocks' => [],
            'settings' => [],
            'channel' => [],
            'id' => '',
            'path' => '/',
        ];
    }

    /**
     * Create a 404 compatible with Rendr page.
     *
     * @return array
     */
    public static function create404ErrorPage()
    {
        $page = self::createPage();
        $page['statusCode'] = 404;
        $page['path'] = self::ERROR_404_PAGE;
        $page['blocks'][] = [
            'type' => 'text',
            'settings' => [
                'content' => 'The page you are looking for could not be found.',
            ],
        ];

        return $page;
    }

    /**
     * Create a 500 compatible with Rendr page.
     *
     * @return array
     */
    public static function create500ErrorPage()
    {
        $page = self::createPage();
        $page['statusCode'] = 500;
        $page['path'] = self::ERROR_500_PAGE;
        $page['blocks'][] = [
            'type' => 'text',
            'settings' => [
                'content' => 'The server encountered an unexpected error. Please try again later.',
            ],
        ];

        return $page;
    }

    public static function createJsonResponse(array $pageData, $preview = false)
    {
        $response = new JsonResponse($pageData, 200, [
            'content-type' => 'application/json',
            'X-Rendr-Content-Type' => 'rendr/document',
        ]);

        if (!$preview && 200 === $pageData['statusCode']) {
            $response->setTtl($pageData['cache']['ttl']);
        } else {
            $response->setPrivate();
        }

        return $response;
    }
}
