<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class ApiController
{
    protected $entityTypeManager;
    protected $serializer;

    public function __construct(EntityTypeManagerInterface $entity_type_manager, NormalizerInterface $serializer)
    {
        $this->entityTypeManager = $entity_type_manager;
        $this->serializer = $serializer;
    }

    public function page($slug)
    {
        // Add starting / to the slug
        $slug = '/'.$slug;
        $pages = $this->entityTypeManager->getStorage('ekino_rendr_page')->loadByProperties([
            'path' => $slug,
        ]);

        if (0 === \count($pages)) {
            return new JsonResponse(['message' => 'The page with slug '.$slug.' could not be found'], 404);
        }

        $page = \reset($pages);

        return new JsonResponse($this->serializer->normalize($page, 'rendr_json'), 200, [
            'content-type' => 'application/json',
        ]);
    }
}
