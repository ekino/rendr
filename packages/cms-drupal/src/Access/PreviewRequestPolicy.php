<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Access;

use Drupal\Core\PageCache\RequestPolicyInterface;
use Symfony\Component\HttpFoundation\Request;

class PreviewRequestPolicy implements RequestPolicyInterface
{
    public function check(Request $request)
    {
        if ('/_preview/ekino-rendr/api-catchall' == $request->getPathInfo()) {
            return RequestPolicyInterface::DENY;
        }
    }
}
