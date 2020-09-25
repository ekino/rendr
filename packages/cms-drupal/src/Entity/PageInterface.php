<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\Core\Entity\RevisionLogInterface;

interface PageInterface extends RevisionLogInterface, EntityChangedInterface, EntityPublishedInterface
{
    public function getTitle();

    public function getPath();

    public function getUrlAlias();

    public function getDefaultPath();

    /**
     * @return bool
     */
    public function isDisplayable();

    /**
     * @return bool
     */
    public function isDynamic();

    /**
     * @return PageInterface[]
     */
    public function getSimilarPages();

    /**
     * @return PageInterface|null
     */
    public function getHierarchicalParentPage();

    /**
     * @param bool $includeCurrent
     *
     * @return PageInterface[]
     */
    public function getSameHierarchicalPages($includeCurrent = false);

    /**
     * @return PageInterface[]
     */
    public function getChildrenHierarchicalPages();

    public function getTtl(ChannelInterface $channel = null);
}
