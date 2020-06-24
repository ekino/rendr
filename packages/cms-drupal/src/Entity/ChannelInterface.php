<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\Core\Entity\RevisionLogInterface;

interface ChannelInterface extends RevisionLogInterface, EntityChangedInterface, EntityPublishedInterface, ContentEntityInterface
{
    public function getPublicSettings(): array;

    public function getPublicSetting($key, $default = null);

    public function getPrivateSettings(): array;

    public function getPrivateSetting($key, $default = null);
}
