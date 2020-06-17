<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Repository;

class PageRepository implements ContentRepositoryInterface
{
    public function loadByProperties(array $conditions)
    {
        $query = \Drupal::entityQuery('ekino_rendr_page');

        foreach ($conditions as $key => $value) {
            switch (true) {
                case null === $value:
                    $query->notExists($key);
                    break;
                default:
                    $query->condition($key, $value);
                    break;
            }
        }

        $result = $query->execute();

        return \Drupal::entityTypeManager()->getStorage('ekino_rendr_page')->loadMultiple($result);
    }
}
