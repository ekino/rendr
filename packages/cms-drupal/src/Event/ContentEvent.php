<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Event;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Symfony\Component\EventDispatcher\Event;

class ContentEvent extends Event
{
    const CONTENT_LOAD_EVENT = 'ekino_rendr.content_load';

    /**
     * @var string
     */
    protected $contentType;

    /**
     * @var string
     */
    protected $slug;

    /**
     * @var ChannelInterface
     */
    protected $channel;

    /**
     * @var array
     */
    protected $context;

    protected $content;

    /**
     * ContentEvent constructor.
     */
    public function __construct(string $contentType, string $slug, ChannelInterface $channel, array $context)
    {
        $this->contentType = $contentType;
        $this->slug = $slug;
        $this->channel = $channel;
        $this->context = $context;
    }

    public function getContentType(): string
    {
        return $this->contentType;
    }

    public function setContentType(string $contentType): self
    {
        $this->contentType = $contentType;

        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

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

    /**
     * @return mixed
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @param mixed $content
     *
     * @return ContentEvent
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    public function getContext(): array
    {
        return $this->context;
    }
}
