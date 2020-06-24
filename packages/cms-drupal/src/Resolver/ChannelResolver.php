<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Resolver;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Controller\ArgumentValueResolverInterface;
use Symfony\Component\HttpKernel\ControllerMetadata\ArgumentMetadata;

class ChannelResolver implements ArgumentValueResolverInterface
{
    protected $entityTypeManager;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager
    ) {
        $this->entityTypeManager = $entity_type_manager;
    }

    /**
     * {@inheritdoc}
     */
    public function supports(Request $request, ArgumentMetadata $argument)
    {
        // This might return no channel so argument must be nullable
        return ChannelInterface::class === $argument->getType() && $argument->isNullable();
    }

    /**
     * {@inheritdoc}
     */
    public function resolve(Request $request, ArgumentMetadata $argument)
    {
        $host = $request->getHost();
        $rendrChannel = $request->get('rendr_channel');
        $path = '';

        if ($rendrChannel) {
            $rendrChannel = 0 === \strpos($rendrChannel, 'http') ? $rendrChannel : \sprintf('http://%s', $rendrChannel);
            $parsedUrl = \parse_url($rendrChannel);
            $host = $parsedUrl['host'];
            $path = isset($parsedUrl['path']) && '/' !== $parsedUrl['path'] ? \substr($parsedUrl['path'], 1) : null;
        }

        // @TODO raise an issue
        // There is an issue where loadByProperties would return no result if 2 keys are passed at the same time
        $channels = $this->entityTypeManager->getStorage('ekino_rendr_channel')->loadByProperties([
            'domain' => $host,
//            'locale' => $locale,
        ]);
        $channels = \array_filter($channels, function ($channel) use ($path) {
            return $channel->get('path')->value === $path;
        });

        if (0 === \count($channels)) {
            yield null;
        }

        yield \reset($channels);
    }

    public static function findMatchingChannels(array $channels, $domain, $path)
    {
        $matching = [];

        foreach ($channels as $channel) {
            foreach ($channel->getTranslationLanguages(true) as $langcode => $language) {
                $translation = $channel->getTranslation($langcode);

                if (self::channelMatchPath($translation, $domain, $path)) {
                    $matching[] = $translation;
                }
            }
        }

        \usort($matching, function ($a, $b) {
            $aStr = $a->get('path')->value ?: '';
            $bStr = $b->get('path')->value ?: '';
            // Sort by path length descending so the first item
            // is the best matching result
            return \strlen($bStr) <=> \strlen($aStr);
        });

        return $matching;
    }

    public static function channelMatchPath(ChannelInterface $channel, $domain, $path)
    {
        $channelDomain = $channel->get('domain')->value ?: '';
        $channelPath = $channel->get('path')->value ?: '';
        $channelPrefix = 0 === \strpos($channelPath, '/') ? $channelPath : ('/'.$channelPath);
        $regexPattern = '/' === $channelPrefix ? '/^\/.*$/' : \sprintf('/^%s(\/.*|)$/', \preg_quote($channelPrefix, '/'));

        return $channelDomain === $domain &&
            \preg_match($regexPattern, $path);
    }

    public static function getPathWithoutPrefix($path, ChannelInterface $channel = null)
    {
        if (!$channel) {
            return $path;
        }

        $channelPath = $channel->get('path')->value ?: '';

        if (empty($channelPath) || '/' === $channelPath) {
            return $path;
        }

        return \substr($path, \strlen($channelPath) + 1);
    }
}
