<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Repository;

interface ContentRepositoryInterface
{
    public function loadByProperties(array $conditions);

    public function getLatestRevision($id);
}
