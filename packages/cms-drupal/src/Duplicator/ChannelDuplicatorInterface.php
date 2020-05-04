<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Duplicator;

use Drupal\ekino_rendr\Entity\ChannelInterface;

interface ChannelDuplicatorInterface
{
    /**
     * Returns an array with 2 sub arrays.
     * The first one contains the pages with children (layout pages)
     * The second contains the pages with no child (leaf pages)
     * i.e. [$layoutPages, $childrenPages].
     *
     * @return array
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function getAffectedPages(ChannelInterface $channel);
}
