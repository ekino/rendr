<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Manager\PageManagerInterface;
use Drupal\ekino_rendr\Model\PageResponse;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;

final class ApiController
{
    protected $entityTypeManager;
    protected $pageManager;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager,
        PageManagerInterface $pageManager
    ) {
        $this->entityTypeManager = $entity_type_manager;
        $this->pageManager = $pageManager;
    }

    public function page(Request $request, $slug, ChannelInterface $channel = null, $preview = false)
    {
        $session = $request->getSession() ?? new Session();

        if ($session->get('rendr_token_owner')) {
            $user = $this->entityTypeManager->getStorage('user')->load($session->get('rendr_token_owner'));
        } else {
            $user = User::load(\Drupal::currentUser()->id());
        }

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
}
