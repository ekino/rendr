<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\Core\Entity\RevisionLogInterface;

interface DocumentInterface extends RevisionLogInterface, EntityChangedInterface, EntityPublishedInterface
{
}
