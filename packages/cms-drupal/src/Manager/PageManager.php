<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Manager;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Model\PageResponse;
use Drupal\ekino_rendr\Repository\ContentRepositoryInterface;
use Drupal\ekino_rendr\Resolver\PageResolverInterface;
use Drupal\user\UserInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class PageManager implements PageManagerInterface
{
    protected $serializer;
    protected $pageResolver;
    protected $pageRepository;

    public function __construct(
        NormalizerInterface $serializer,
        PageResolverInterface $pageResolver,
        ContentRepositoryInterface $pageRepository
    ) {
        $this->serializer = $serializer;
        $this->pageResolver = $pageResolver;
        $this->pageRepository = $pageRepository;
    }

    public function getPageData(Request $request, $slug, UserInterface $user, ChannelInterface $channel = null, $preview = false, $extraContext = [])
    {
        $page = $this->getPage($slug, $user, $channel, $preview);

        if (!$page) {
            return null;
        }

        // Get the latest revision in case of preview mode
        if ($preview) {
            $page = $this->pageRepository->getLatestRevision($page->id());
        }

        return $this->serializer->normalize($page, 'rendr_json', [
            'preview' => $preview,
            'slug' => $slug,
            'request' => $request,
            'channel' => $channel,
            'page' => $page,
        ] + $extraContext);
    }

    public function get404PageData(Request $request, UserInterface $user, ChannelInterface $channel = null, $preview = false)
    {
        $error404Page = $this->getPage(PageResponse::ERROR_404_PAGE, $user, $channel, $preview);

        if (!$error404Page) {
            return PageResponse::create404ErrorPage();
        }

        $result = $this->serializer->normalize($error404Page, 'rendr_json', [
            'preview' => $preview,
            'slug' => PageResponse::ERROR_404_PAGE,
            'request' => $request,
            'channel' => $channel,
            'page' => $error404Page,
        ]);

        $result['statusCode'] = 404;

        return $result;
    }

    public function get500PageData(Request $request, UserInterface $user = null, ChannelInterface $channel = null, $preview = false)
    {
        $error500Page = $this->getPage(PageResponse::ERROR_500_PAGE, $user, $channel, $preview);

        if (!$error500Page) {
            return PageResponse::create500ErrorPage();
        }

        $result = $this->serializer->normalize($error500Page, 'rendr_json', [
            'preview' => $preview,
            'slug' => PageResponse::ERROR_500_PAGE,
            'request' => $request,
            'channel' => $channel,
            'page' => $error500Page,
        ]);

        $result['statusCode'] = 500;

        return $result;
    }

    public function getPage($slug, UserInterface $user, ChannelInterface $channel = null, $preview = false)
    {
        $conditions = $this->pageResolver->getPageConditions($slug, [
            'preview' => $preview,
            'user' => $user,
            'channel' => $channel,
        ]);

        $urlAliasConditions = $conditions;
        $urlAliasConditions['url_alias'] = $conditions['path'];
        unset($urlAliasConditions['path']);

        $pages = $this->pageRepository->loadByProperties($urlAliasConditions);

        if (0 === \count($pages)) {
            $pages = $this->pageRepository->loadByProperties($conditions);

            if (0 === \count($pages)) {
                return null;
            }
        }

        $page = \reset($pages);

        if (!$page->hasTranslation($channel->language()->getId())) {
            return null;
        }

        return $page->getTranslation($channel->language()->getId());
    }
}
