<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Access;

use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Symfony\Component\HttpFoundation\Request;

class PreviewAccessCheck implements AccessInterface
{
    /**
     * {@inheritdoc}
     */
    public function access(AccountInterface $account, Request $request)
    {
        // @TODO permission should also be granted to a valid URL token
        // Token are attached to users
        // Matching a token should grant this session the same permissions as
        // the user the token is attached to
        return $account->hasPermission('administer ekino_rendr pages') ? AccessResult::allowed() : AccessResult::forbidden();
    }
}
