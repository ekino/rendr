<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Event;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Symfony\Component\EventDispatcher\Event;

class UrlEvent extends Event
{
    const PAGE_URL_EVENT = 'ekino_rendr.page_url';
    const CONTENT_URL_EVENT = 'ekino_rendr.cotent_url';

    private $channel;
    private $routeName;
    private $routeParameters;
    private $options;
    private $url;
    private $context;

    public function __construct($routeName, $routeParameters = [], $options = [], ChannelInterface $channel = null, $context = [])
    {
        $this->routeName = $routeName;
        $this->routeParameters = $routeParameters;
        $this->options = $options;
        $this->channel = $channel;
        $this->context = $context;
    }

    /**
     * @return array
     */
    public function getContext()
    {
        return $this->context;
    }

    public function setContext(array $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function getChannel(): ?ChannelInterface
    {
        return $this->channel;
    }

    public function setChannel(?ChannelInterface $channel): self
    {
        $this->channel = $channel;

        return $this;
    }

    /**
     * @return string
     */
    public function getRouteName()
    {
        return $this->routeName;
    }

    /**
     * @param string $routeName
     *
     * @return UrlEvent
     */
    public function setRouteName($routeName)
    {
        $this->routeName = $routeName;

        return $this;
    }

    public function getRouteParameters(): array
    {
        return $this->routeParameters;
    }

    public function setRouteParameters(array $routeParameters): self
    {
        $this->routeParameters = $routeParameters;

        return $this;
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function setOptions(array $options): self
    {
        $this->options = $options;

        return $this;
    }

    /**
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * @param string $url
     *
     * @return PreviewUrlEvent
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }
}
