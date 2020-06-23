<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Event;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Symfony\Component\EventDispatcher\Event;

class PreviewUrlEvent extends Event
{
    const EVENT = 'ekino_rendr.preview_url';

    private $channel;
    private $routeName;
    private $routeParameters;
    private $options;
    private $url;

    public function __construct($routeName, $routeParameters = [], $options = [], ChannelInterface $channel = null)
    {
        $this->routeName = $routeName;
        $this->routeParameters = $routeParameters;
        $this->options = $options;
        $this->channel = $channel;
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
     * @return PreviewUrlEvent
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
