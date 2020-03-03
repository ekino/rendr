<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Resolver\PageResolverInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
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

    public function page($slug, $preview = false)
    {
        $pages = $this->entityTypeManager->getStorage('ekino_rendr_page')->loadByProperties(
            $this->pageResolver->getPageConditions($slug, ['preview' => $preview])
        );

        if (0 === \count($pages)) {
            return new JsonResponse(['message' => 'The page with slug '.$slug.' could not be found'], 404);
        }

        $page = \reset($pages);

        return new JsonResponse($this->serializer->normalize($page, 'rendr_json', ['preview' => $preview]), 200, [
            'content-type' => 'application/json',
        ]);
    }
}
