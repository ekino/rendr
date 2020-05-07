<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\Controller\EntityViewController;
use Drupal\Core\Entity\EntityInterface;

class ContentViewController extends EntityViewController
{
    public function view(EntityInterface $ekino_rendr_page, $view_mode = 'full')
    {
        return parent::view($ekino_rendr_page, $view_mode);
    }

    public function viewChannel(EntityInterface $ekino_rendr_channel, $view_mode = 'full')
    {
        return parent::view($ekino_rendr_channel, $view_mode);
    }
}
