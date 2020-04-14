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
        $locale = $request->getLocale();
        $rendrChannel = $request->get('rendr_channel');

        if ($rendrChannel) {
            $rendrChannel = 0 === \strpos($rendrChannel, 'http') ? $rendrChannel : \sprintf('http://%s', $rendrChannel);
            $parsedUrl = \parse_url($rendrChannel);
            $host = $parsedUrl['host'];
            $locale = isset($parsedUrl['path']) && '/' !== $parsedUrl['path'] ? \substr($parsedUrl['path'], 1) : null;
        }

        // @TODO raise an issue
        // There is an issue where loadByProperties would return no result if 2 keys are passed at the same time
        $channels = $this->entityTypeManager->getStorage('ekino_rendr_channel')->loadByProperties([
            'domain' => $host,
//            'locale' => $locale,
        ]);
        $channels = \array_filter($channels, function ($channel) use ($locale) {
            return $channel->get('locale')->value === $locale;
        });

        if (0 === \count($channels)) {
            yield null;
        }

        yield \reset($channels);
    }
}
