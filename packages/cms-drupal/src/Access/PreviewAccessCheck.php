<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class PreviewAccessCheck implements AccessInterface
{
    protected $entityTypeManager;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager
    ) {
        $this->entityTypeManager = $entity_type_manager;
    }

    /**
     * {@inheritdoc}
     */
    public function access(AccountInterface $account, Request $request)
    {
        $session = $request->getSession();

        if ($account->hasPermission('view ekino_rendr pages') || $session->get('rendr_allowed_channels')) {
            return AccessResult::allowed();
        }

        $previewToken = $request->get('_preview_token');

        if (null === $previewToken) {
            return AccessResult::forbidden();
        }

        $users = $this->entityTypeManager->getStorage('user')->loadByProperties([
            'field_rendr_preview_token' => $previewToken,
        ]);

        if (1 !== \count($users)) {
            return AccessResult::forbidden();
        }

        $tokenOwner = \reset($users);
        $allowedChannels = $tokenOwner->get('field_rendr_allowed_channels')->getValue();
        $session->set('rendr_allowed_channels', \array_column($allowedChannels, 'target_id'));

        return AccessResult::allowed();
    }
}
