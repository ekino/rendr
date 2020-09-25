<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Duplicator;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Entity\PageInterface;

class ChannelDuplicator implements ChannelDuplicatorInterface
{
    /**
     * @var EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    /**
     * ChannelDuplicator constructor.
     */
    public function __construct(EntityTypeManagerInterface $entityTypeManager)
    {
        $this->entityTypeManager = $entityTypeManager;
    }

    public function duplicate(ChannelInterface $channel)
    {
        $duplicate = $channel->createDuplicate();
        $duplicate->save();

        [$layoutPages, $childrenPages] = $this->getAffectedPages($channel);

        /** @var PageInterface $layoutPage */
        foreach ($layoutPages as $layoutPage) {
            $layoutClone = $layoutPage->createDuplicate();
            $layoutClone->set('channels', [$duplicate]);
            $layoutClone->save();

            foreach ($childrenPages as $childPage) {
                if (\array_column($childPage->get('parent_page')->getValue(), 'target_id')[0] === $layoutPage->id()) {
                    $clone = $childPage->createDuplicate();
                    $clone->set('channels', [$duplicate]);
                    $clone->set('parent_page', $layoutClone->id());
                    $clone->save();
                }
            }
        }

        return $duplicate;
    }

    public function getAffectedPages(ChannelInterface $channel)
    {
        $affectedPages = $this->entityTypeManager->getStorage('ekino_rendr_page')->loadByProperties([
            'channels' => [$channel->id()],
        ]);

        return $this->extractLayoutPages($affectedPages);
    }

    /**
     * We don't want to duplicate layout pages since that would go
     * against their purpose of having shared content.
     * So for each page, we check if there is a child within the pool of affected pages.
     * If yes, then it is a layout page and therefore it should not be duplicated.
     *
     * @return array
     */
    protected function extractLayoutPages(array $pages)
    {
        $layoutPages = [];

        $hasChildren = static function ($currentPage) use ($pages) {
            foreach ($pages as $page) {
                $parentIds = !empty($page->get('parent_page')->getValue()) ? \array_column($page->get('parent_page')->getValue(), 'target_id') : [];
                $parentId = \reset($parentIds);
                if ($parentId === $currentPage->id()) {
                    return true;
                }
            }

            return false;
        };

        foreach ($pages as $key => $value) {
            if ($hasChildren($value)) {
                $layoutPages[$key] = $value;
            }
        }

        return [$layoutPages, \array_diff_key($pages, $layoutPages)];
    }
}
