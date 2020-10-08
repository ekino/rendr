<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Event;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Symfony\Component\EventDispatcher\Event;

class PageEvent extends Event
{
    const PAGE_LOAD_EVENT = 'ekino_rendr.page_load';

    /**
     * @var string
     */
    protected $pageSlug;

    /**
     * @var ChannelInterface
     */
    protected $channel;

    /**
     * @var array
     */
    protected $context;

    /**
     * ContentEvent constructor.
     */
    public function __construct(string $pageSlug, ChannelInterface $channel, array $context)
    {
        $this->pageSlug = $pageSlug;
        $this->channel = $channel;
        $this->context = $context;
    }

    public function getPageSlug(): string
    {
        return $this->pageSlug;
    }

    public function setPageSlug(string $pageSlug): self
    {
        $this->pageSlug = $pageSlug;

        return $this;
    }

    public function getChannel(): ChannelInterface
    {
        return $this->channel;
    }

    public function setChannel(ChannelInterface $channel): self
    {
        $this->channel = $channel;

        return $this;
    }

    public function getContext(): array
    {
        return $this->context;
    }
}
