<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Router;

use Drupal\Core\Entity\EntityTypeManager;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\ekino_rendr\Entity\PageInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;

/**
 * @experimental
 */
class RouterSubscriber
{
    const VIEW_BASE_URL = '/ekino-rendr/api';
    const PREVIEW_BASE_URL = '/_preview/ekino-rendr/api';

    private $entityTypeManager;
    private $lengthView;

    public function __construct(EntityTypeManager $entityTypeManager)
    {
        $this->entityTypeManager = $entityTypeManager;

        $this->lengthView = \strlen(self::PREVIEW_BASE_URL);
    }

    private function getRequirements($requirements)
    {
        return \array_merge([
            '_access' => 'TRUE',
            'content_type' => '^((?!page).){4}[^\/]*$',
        ], $requirements);
    }

    private function getDefaults($defaults = [])
    {
        return \array_merge([
            '_controller' => 'Drupal\ekino_rendr\Controller\ContentApiController::dynamicContent',
            '_title' => 'Dynamic content',
        ], $defaults);
    }

    private function getRoute($path, $defaults = [], $requirements = [])
    {
        return new Route($path, $this->getDefaults($defaults), $this->getRequirements($requirements));
    }

    public function routes()
    {
        $storage = $this->entityTypeManager->getStorage('ekino_rendr_page');
        $ids = \Drupal::entityQuery('ekino_rendr_page')
            ->condition('path', '%:%', 'LIKE')
            ->execute()
            ;

        $collection = new RouteCollection();

        if (empty($ids)) {
            return $collection;
        }

        $pages = $storage->loadMultiple($ids);

        /** @var PageInterface $page */
        foreach ($pages as $page) {
            /** @var $node TranslatableInterface */
            $translations = $page->getTranslationLanguages();

            foreach ($translations as $language) {
                /** @var PageInterface $translatedPage */
                $translatedPage = $page->getTranslation($language->getId());

                if (!$translatedPage->getDefaultPath() || 0 === \strlen($translatedPage->getDefaultPath())) {
                    continue;
                }

                if (false === ($pos = \strpos($translatedPage->getDefaultPath(), ':'))) { // not a dynamic page
                    continue;
                }

                $channels = $page->get('channels')->referencedEntities();

                foreach ($channels as $channel) {
                    if (!$channel->hasTranslation($language->getId())) { // no channel translation for the current page language, no link possible
                        continue;
                    }

                    $translatedChannel = $channel->getTranslation($language->getId());

                    $entity = \substr($translatedPage->getDefaultPath(), $pos + 1);
                    $path = \substr($translatedPage->getDefaultPath(), 0, $pos);
                    $channelPath = $translatedChannel->get('path')->value ?? '';

                    if (\strlen($channelPath) > 0 && '/' != $channelPath[0]) {
                        $channelPath = '/'.$channelPath;
                    }

                    $route_name = \sprintf('%s_rendr_dynamic_%s_%s', $channel->get('id')->value, $entity, $language->getId());

                    $collection->add($route_name, $this->getRoute(\sprintf('%s%s%s{slug}', self::VIEW_BASE_URL, $channelPath, $path), [
                        'content_type' => $entity,
                        '_from_path' => $translatedPage->getDefaultPath(),
                    ]));

                    $collection->add('preview_'.$route_name, $this->getRoute(\sprintf('%s%s%s{slug}', self::PREVIEW_BASE_URL, $channelPath, $path), [
                        'content_type' => $entity,
                        '_from_path' => $translatedPage->getDefaultPath(),
                        'preview' => true,
                    ], [
                        '_rendr_preview_access_check' => 'TRUE',
                    ]));
                }
            }
        }

        return $collection;
    }
}
