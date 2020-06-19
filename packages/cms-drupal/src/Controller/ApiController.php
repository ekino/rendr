<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\AccessAwareRouterInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Manager\PageManagerInterface;
use Drupal\ekino_rendr\Model\PageResponse;
use Drupal\ekino_rendr\Resolver\ChannelResolver;
use Drupal\lsm\Router\Router;
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
        $domain = $request->get('channel_domain');
        $path = $request->get('path');
        $channels = ChannelResolver::findMatchingChannels(
            $this->entityTypeManager->getStorage('ekino_rendr_channel')->loadByProperties(),
            $domain,
            $path
        );

        $channel = \reset($channels) ?: null;
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
                // First try custom routes
                $route = $this->router->match(Router::VIEW_BASE_URL.$cleanedPath);
            } catch (ResourceNotFoundException $e) {
                // If no match, try for a page url
                $route = $this->router->match(Router::VIEW_BASE_URL.'/page'.$cleanedPath);
            }
        } catch (ResourceNotFoundException $exception) {
            \Drupal::logger('ekino_rendr')->warning('The page with slug @slug could not be found', ['@slug' => $cleanedPath]);

            return PageResponse::createJsonResponse(
                $this->pageManager->get404PageData($request, $user, $channel, $preview)
            );
        }

        return $this->forwardFromRoute($route, $request, $channel);
    }

    public function page(Request $request, $slug, ChannelInterface $channel = null, $preview = false)
    {
        $user = $this->getUser($request);

        try {
            $pageData = $this->pageManager->getPageData($request, $slug, $user, $channel, $preview);

            if (!$pageData) {
                \Drupal::logger('ekino_rendr')->warning('The page with slug @slug could not be found', ['@slug' => $slug]);

                $pageData = $this->pageManager->get404PageData($request, $user, $channel, $preview);
            }
        } catch (\Exception $exception) {
            \Drupal::logger('ekino_rendr')->error($exception->getMessage()."\n".$exception->getTraceAsString());

            $pageData = $this->pageManager->get500PageData($request, $user, $channel, $preview);
        }

        return PageResponse::createJsonResponse($pageData);
    }

    protected function forwardFromRoute(array $route, Request $request, ChannelInterface $channel = null)
    {
        $subRequest = clone $request;
        $subRequest->attributes = new ParameterBag($route);
        $controller = \explode('::', $route['_controller']);
        $class = \call_user_func([$controller[0], 'create']);

        return $this->forward([$class, $controller[1]], \array_merge($route, [
            'request' => $subRequest,
            'channel' => $channel,
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
