<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Resolver;

/**
 * Page resolver interface.
 */
interface PageResolverInterface
{
    public function getPageConditions($slug, $context = []);
}
