<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Event\ContentEvent;
use Drupal\ekino_rendr\Event\PageEvent;
use Drupal\ekino_rendr\Exception\ContentNotFoundException;
use Drupal\ekino_rendr\Manager\PageManagerInterface;
use Drupal\ekino_rendr\Model\PageResponse;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;

/**
 * @experimental
 */
final class ContentApiController
{
    protected $entityTypeManager;
    protected $pageManager;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager,
        PageManagerInterface $pageManager
    ) {
        $this->entityTypeManager = $entity_type_manager;
        $this->pageManager = $pageManager;
    }

    public static function create()
    {
        return new self(
            \Drupal::getContainer()->get('entity_type.manager'),
            \Drupal::getContainer()->get('ekino_rendr.manager.page')
        );
    }

    public function dynamicContent(Request $request, $slug, $content_type, ChannelInterface $channel = null, $preview = false)
    {
        $session = $request->getSession() ?? new Session();

        // make the code backward compatible, but the default argument can be removed
        // @deprecated - remove the default value, _from_path should be mandatory
        $pageSlug = $request->attributes->get('_from_path', ':'.$content_type);

        if ($session->get('rendr_token_owner')) {
            $user = $this->entityTypeManager->getStorage('user')->load($session->get('rendr_token_owner'));
        } else {
            $user = User::load(\Drupal::currentUser()->id());
        }

        try {
            if (!$channel) {
                throw new ContentNotFoundException(400, \sprintf('No channel was provided.<br/>%s', \sprintf('%s::%s (l. %d)', __CLASS__, __FUNCTION__, __LINE__)));
            }

            $contentEvent = new ContentEvent($content_type, $slug, $channel, ['request' => $request]);
            \Drupal::getContainer()->get('event_dispatcher')->dispatch(ContentEvent::CONTENT_LOAD_EVENT, $contentEvent);

            $content = $contentEvent->getContent() ?: $this->getContent(
                $contentEvent->getContentType(),
                $contentEvent->getSlug(),
                $contentEvent->getChannel(),
                $preview
            );

            $pageEvent = new PageEvent($pageSlug, $channel, [
                'request' => $request,
                'user' => $user,
                'content' => $content,
            ]);
            \Drupal::getContainer()->get('event_dispatcher')->dispatch(PageEvent::PAGE_LOAD_EVENT, $pageEvent);

            $pageData = $this->pageManager->getPageData(
                $request,
                $pageEvent->getPageSlug(),
                $user,
                $pageEvent->getChannel(),
                $preview,
                ['content' => $content]
            );

            if (!$pageData) {
                \Drupal::logger('ekino_rendr')->warning(
                    'The page with slug @slug and channel @channel(@channelId) could not be found.<br/>@stackTrace',
                    [
                        '@slug' => $slug,
                        '@channel' => $channel->label(),
                        '@channelId' => $channel->id(),
                        '@stackTrace' => \sprintf(
                            '%s::%s (l. %d)',
                            __CLASS__,
                            __FUNCTION__,
                            __LINE__
                        ),
                    ]);

                $pageData = $this->pageManager->get404PageData($request, $user, $channel, $preview);
            }

            $pageData['head']['title'] = $content->getTitle();
        } catch (ContentNotFoundException $exception) {
            \Drupal::logger('ekino_rendr')->warning($exception->getMessage());

            $pageData = $this->pageManager->get404PageData($request, $user, $channel, $preview);
        } catch (\Exception $exception) {
            \Drupal::logger('ekino_rendr')->error($exception->getMessage()."\n".$exception->getTraceAsString());

            $pageData = $this->pageManager->get500PageData($request, $user, $channel, $preview);
        }

        return PageResponse::createJsonResponse($pageData);
    }

    protected function getContent($contentType, $slug, $channel = null, $preview = false)
    {
        /** @var FieldableEntityInterface[] $contents */
        $conditions = [
          'type' => $contentType,
          'field_slug' => $slug,
        ];

        if (!$preview) {
            $conditions['status'] = true;
        }

        $contents = $this->entityTypeManager->getStorage('node')->loadByProperties($conditions);

        $contents = \array_filter($contents, static function ($content) use ($channel) {
            $matchChannel = true;

            // valid channels are bound to translation entry
            if ($content->hasTranslation($channel->language()->getId())) {
                $content = $content->getTranslation($channel->language()->getId());
            }

            if ($content->hasField('field_channels')) {
                $matchChannel = false;

                foreach ($content->get('field_channels')->referencedEntities() as $linkedChannel) {
                    $matchChannel = $linkedChannel->id() === $channel->id();

                    if ($matchChannel) {
                        break;
                    }
                }
            }

            return $matchChannel;
        });

        if (0 === \count($contents)) {
            throw new ContentNotFoundException(404, \sprintf('Content of type "%s" with slug "%s" could not be found.', $contentType, $slug));
        }

        $content = \reset($contents);

        if (!$content->hasTranslation($channel->language()->getId())) {
            throw new ContentNotFoundException(404, \sprintf('Content of type "%s" with slug "%s" does not have any translation matching the channel %s (lang %s).', $contentType, $slug, $channel->get('label')->value, $channel->language()->getId()));
        }

        $content = $content->getTranslation($channel->language()->getId());

        return $content;
    }
}
