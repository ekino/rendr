<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Repository;

use Drupal\ekino_rendr\Entity\PageInterface;

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

    /**
     * Return pages that have the same path but are assign to other channels.
     *
     * @return PageInterface[]
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function getSimilarPages(PageInterface $page)
    {
        return $this->findByPath($page->getPath(), \array_column($page->get('channels')->getValue(), 'target_id'), false);
    }

    /**
     * Return pages that have a path one level higher than the current page.
     * e.g. if the current page has a path /foo/bar/baz, will return the page with path
     * /foo/bar in the same channel.
     *
     * @return PageInterface[]
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function getHierarchicalParentPage(PageInterface $page)
    {
        $parentPath = $this->getParentPath($page);

        if (empty($parentPath)) {
            return [];
        }

        $channelIds = \array_column($page->get('channels')->getValue(), 'target_id');

        return $this->findByPath($parentPath, $channelIds);
    }

    /**
     * Return pages that have the same hierarchical level as the current one.
     * e.g. if the current page has path /foo/bar, will return any pages with path
     * /foo/*.
     *
     * @return PageInterface[]
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function getSameHierarchicalPages(PageInterface $page, $includeCurrent = false)
    {
        $parentPath = $this->getParentPath($page);

        if (empty($parentPath)) {
            return [];
        }

        $channelIds = \array_column($page->get('channels')->getValue(), 'target_id');
        $regex = \sprintf('%s%s[^/]+', $parentPath, '/' === $parentPath ? '' : '/');

        $results = $this->getPagesMatchingPath($regex, $channelIds);

        return $includeCurrent ? $results : \array_filter($results, function ($current) use ($page) {
            return $current->id() !== $page->id();
        });
    }

    /**
     * Return pages that have the one more hierarchical level than the current one.
     * e.g. if the current page has path /foo/bar, will return any pages with path
     * /foo/bar/*.
     *
     * @return PageInterface[]
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function getChildrenHierarchicalPages(PageInterface $page)
    {
        if (empty($page->getPath())) {
            return [];
        }

        $channelIds = \array_column($page->get('channels')->getValue(), 'target_id');
        $regex = \sprintf('%s%s[^/]+', $page->getPath(), '/' === $page->getPath() ? '' : '/');

        return $this->getPagesMatchingPath($regex, $channelIds);
    }

    public function getPageByPath($path, $channelId)
    {
        $pages = $this->findByPath($path, [$channelId]);
        $page = \reset($pages);

        return false === $page ? null : $page;
    }

    public function findByPath($path, $channelIds, $include = true)
    {
        $query = \Drupal::entityQuery('ekino_rendr_page');
        $query->condition('published', true)
            ->condition('channels', $channelIds, $include ? 'IN' : 'NOT IN')
            ->condition('path', $path, '=')
        ;

        $result = $query->execute();

        if (0 === \count($result)) {
            return [];
        }

        return \Drupal::entityTypeManager()->getStorage('ekino_rendr_page')->loadMultiple($result);
    }

    public function getLatestRevision($id)
    {
        $revisions = \Drupal::entityTypeManager()->getStorage('ekino_rendr_page')->getQuery()
            ->latestRevision()->condition('id', $id)->execute();
        $revisionIds = \array_keys($revisions);

        return \Drupal::entityTypeManager()->getStorage('ekino_rendr_page')->loadRevision(\reset($revisionIds));
    }

    private function getParentPath(PageInterface $page)
    {
        $explodedPath = \explode('/', $page->getPath());

        if ('/' === \trim($page->getPath()) || 1 >= \count($explodedPath)) {
            return '';
        }

        \array_pop($explodedPath);

        return 1 === \count($explodedPath) ? '/' : \implode('/', $explodedPath);
    }

    /**
     * @param string $regex
     *
     * @return PageInterface[]
     *
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    private function getPagesMatchingPath($regex, array $channelIds)
    {
        $query = \Drupal::entityQuery('ekino_rendr_page');
        $query->condition('published', true)
            ->condition('channels', $channelIds, 'IN')
            ->condition('path', $regex, 'SIMILAR TO')
        ;

        $result = $query->execute();

        return \Drupal::entityTypeManager()->getStorage('ekino_rendr_page')->loadMultiple($result);
    }
}
