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

    public function getPageData(Request $request, $slug, UserInterface $user, ChannelInterface $channel = null, $preview = false)
    {
        $page = $this->getPage($slug, $user, $channel, $preview);

        if (!$page) {
            return null;
        }

        return $this->serializer->normalize($page, 'rendr_json', [
            'preview' => $preview,
            'slug' => $slug,
            'request' => $request,
            'channel' => $channel,
        ]);
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
        ]);

        $result['statusCode'] = 500;

        return $result;
    }

    protected function getPage($slug, UserInterface $user, ChannelInterface $channel = null, $preview = false)
    {
        $pages = $this->pageRepository->loadByProperties(
            $this->pageResolver->getPageConditions($slug, [
                'preview' => $preview,
                'user' => $user,
                'channel' => $channel,
            ])
        );

        if (0 === \count($pages)) {
            return null;
        }

        return \reset($pages);
    }
}
