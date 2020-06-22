<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Manager;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\user\UserInterface;
use Symfony\Component\HttpFoundation\Request;

interface PageManagerInterface
{
    public function getPageData(Request $request, $slug, UserInterface $user, ChannelInterface $channel = null, $preview = false, $extraContext = []);

    public function get404PageData(Request $request, UserInterface $user, ChannelInterface $channel = null, $preview = false);

    public function get500PageData(Request $request, UserInterface $user, ChannelInterface $channel = null, $preview = false);
}
