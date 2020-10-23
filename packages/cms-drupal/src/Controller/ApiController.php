<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\AccessAwareRouterInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Manager\PageManagerInterface;
use Drupal\ekino_rendr\Model\PageResponse;
use Drupal\ekino_rendr\Resolver\ChannelResolver;
use Drupal\ekino_rendr\Router\RouterSubscriber;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\ControllerMetadata\ArgumentMetadataFactory;
use Symfony\Component\HttpKernel\ControllerMetadata\ArgumentMetadataFactoryInterface;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;

final class ApiController
{
    protected $entityTypeManager;
    protected $pageManager;
    protected $router;
    protected $argumentMetadataFactory;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager,
        PageManagerInterface $pageManager,
        AccessAwareRouterInterface $router,
        ArgumentMetadataFactoryInterface $argumentMetadataFactory = null
    ) {
        $this->entityTypeManager = $entity_type_manager;
        $this->pageManager = $pageManager;
        $this->router = $router;
        $this->argumentMetadataFactory = $argumentMetadataFactory ?: new ArgumentMetadataFactory();
    }

    public static function create()
    {
        return new self(
            \Drupal::getContainer()->get('entity_type.manager'),
            \Drupal::getContainer()->get('ekino_rendr.manager.page'),
            \Drupal::getContainer()->get('router')
        );
    }

    public function catchAll(Request $request, $preview = false)
    {
        $user = $this->getUser($request);
        $channel = ChannelResolver::resolveChannelFromRequest($request);
        $path = $request->get(ChannelResolver::PATH_REQUEST_KEY);
        $cleanedPath = ChannelResolver::getPathWithoutPrefix($path, $channel);

        // Prevent calling this function again
        if ('-catchall' === $cleanedPath) {
            \Drupal::logger('ekino_rendr')->warning('Attempt to call the catch all route recursively.');

            return PageResponse::createJsonResponse(
                $this->pageManager->get500PageData($request, $user, $channel, $preview)
            );
        }

        try {
            try {
                // First try a page url that can override a custom route
                $pageOverride = $this->pageManager->getPage($cleanedPath, $user, $channel, $preview);

                // Then if no page was found, we check for a custom route
                $route = $pageOverride ? $this->router->match(RouterSubscriber::VIEW_BASE_URL.'/page') :
                    $this->router->match(RouterSubscriber::VIEW_BASE_URL.$path);
            } catch (ResourceNotFoundException $e) {
                // If no match, try for a page url
                $route = $this->router->match(RouterSubscriber::VIEW_BASE_URL.'/page');
            }
        } catch (ResourceNotFoundException $exception) {
            \Drupal::logger('ekino_rendr')->warning(
                'The page with slug @slug and channel @channel(@channelId) could not be found.<br/>@stackTrace',
                [
                    '@slug' => $cleanedPath,
                    '@channel' => $channel ? $channel->label() : '',
                    '@channelId' => $channel ? $channel->id() : 'null',
                    '@stackTrace' => $exception->getTraceAsString(),
                ]);

            return PageResponse::createJsonResponse(
                $this->pageManager->get404PageData($request, $user, $channel, $preview)
            );
        }

        return $this->forwardFromRoute($route, $request, $channel, $preview);
    }

    public function page(Request $request, ChannelInterface $channel = null, $preview = false)
    {
        $user = $this->getUser($request);
        $slug = ChannelResolver::getPathWithoutPrefix($request->get('path'), $channel);

        try {
            $pageData = $this->pageManager->getPageData($request, $slug, $user, $channel, $preview);

            if (!$pageData) {
                \Drupal::logger('ekino_rendr')->warning(
                    'The page with slug @slug and channel @channel(@channelId) could not be found.<br/>@stackTrace',
                    [
                        '@slug' => $slug,
                        '@channel' => $channel ? $channel->label() : '',
                        '@channelId' => $channel ? $channel->id() : 'null',
                        '@stackTrace' => \sprintf(
                            '%s::%s (l. %d)',
                            __CLASS__,
                            __FUNCTION__,
                            __LINE__
                        ),
                    ]);

                $pageData = $this->pageManager->get404PageData($request, $user, $channel, $preview);
            }
        } catch (\Exception $exception) {
            \Drupal::logger('ekino_rendr')->error($exception->getMessage()."\n".$exception->getTraceAsString());

            $pageData = $this->pageManager->get500PageData($request, $user, $channel, $preview);
        }

        return PageResponse::createJsonResponse($pageData);
    }

    protected function forwardFromRoute(array $route, Request $request, ChannelInterface $channel = null, $preview = false)
    {
        $subRequest = clone $request;
        $subRequest->attributes = new ParameterBag($route);
        $controller = \explode('::', $route['_controller']);
        $reflection = new \ReflectionClass($controller[0]);

        if (!$reflection->hasMethod('create')) {
            \Drupal::logger('ekino_rendr')->error(\sprintf('The controller %s does not have a method create', $controller[0]));
            $user = $this->getUser($request);
            $pageData = $this->pageManager->get500PageData($request, $user, $channel, $preview);

            return PageResponse::createJsonResponse($pageData);
        }

        $class = \call_user_func([$controller[0], 'create']);

        return $this->forward([$class, $controller[1]], \array_merge($route, [
            'request' => $subRequest,
            'channel' => $channel,
            'preview' => $preview,
        ]));
    }

    protected function forward(array $controller, array $arguments)
    {
        $computedArguments = [];

        foreach ($this->argumentMetadataFactory->createArgumentMetadata($controller) as $metadata) {
            $computedArguments[] = \array_key_exists($metadata->getName(), $arguments) ?
                $arguments[$metadata->getName()] :
                $metadata->getDefaultValue();
        }

        return $controller[0]->{$controller[1]}(...$computedArguments);
    }

    protected function getUser(Request $request)
    {
        $session = $request->getSession() ?? new Session();

        if ($session->get('rendr_token_owner')) {
            return $this->entityTypeManager->getStorage('user')->load($session->get('rendr_token_owner'));
        }

        return User::load(\Drupal::currentUser()->id());
    }
}
