<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Resolver\PageResolverInterface;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class ApiController
{
    protected $entityTypeManager;
    protected $serializer;
    protected $pageResolver;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager,
        NormalizerInterface $serializer,
        PageResolverInterface $pageResolver
    ) {
        $this->entityTypeManager = $entity_type_manager;
        $this->serializer = $serializer;
        $this->pageResolver = $pageResolver;
    }

    public function page(Request $request, $slug, ChannelInterface $channel = null, $preview = false)
    {
        $session = $request->getSession() ?? new Session();

        if ($session->get('rendr_token_owner')) {
            $user = $this->entityTypeManager->getStorage('user')->load($session->get('rendr_token_owner'));
        } else {
            $user = User::load(\Drupal::currentUser()->id());
        }

        $pages = $this->entityTypeManager->getStorage('ekino_rendr_page')->loadByProperties(
            $this->pageResolver->getPageConditions($slug, [
                'preview' => $preview,
                'user' => $user,
                'channel' => $channel,
            ])
        );

        if (0 === \count($pages)) {
            return new JsonResponse(['message' => 'The page with slug '.$slug.' could not be found'], 404);
        }

        $page = \reset($pages);

        return new JsonResponse($this->serializer->normalize($page, 'rendr_json', [
            'preview' => $preview,
            'slug' => $slug,
            'request' => $request,
            'channel' => $channel,
        ]), 200, [
            'content-type' => 'application/json',
        ]);
    }
}
