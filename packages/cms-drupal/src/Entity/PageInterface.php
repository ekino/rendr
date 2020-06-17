<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\Core\Entity\RevisionLogInterface;

interface PageInterface extends RevisionLogInterface, EntityChangedInterface, EntityPublishedInterface
{
    public function getTitle();

    public function getTtl(ChannelInterface $channel = null);
}
