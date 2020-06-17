<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Resolver;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\user\Entity\User;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Page resolver.
 */
class PageResolver implements PageResolverInterface
{
    public function getPageConditions($slug, $context = [])
    {
        $resolver = new OptionsResolver();
        $resolver->setDefined('user');
        $resolver->setDefaults([
            'channel' => null,
            'preview' => false,
        ]);
        $resolver->setAllowedTypes('channel', ['null', ChannelInterface::class]);
        $resolver->setAllowedTypes('preview', 'bool');
        $resolver->setAllowedTypes('user', User::class);
        $resolver->setRequired('user');

        $options = $resolver->resolve($context);
        $conditions = [
            // Ensure the slug starts with a /
            'path' => 0 === \strpos($slug, '/') ? $slug : '/'.$slug,
            'published' => true,
        ];

        if ($options['channel']) {
            $conditions['channels'] = [$options['channel']->id()];
            $conditions['langcode'] = [$options['channel']->language()->getId()];
        } else {
            $conditions['channels'] = null;
        }

        if ($options['preview']) {
            $conditions = \array_merge($conditions, $this->getUserSpecificConditions($options['user'], $options['channel']));
            unset($conditions['published']);
        }

        return $conditions;
    }

    protected function getUserSpecificConditions(User $user, ChannelInterface $channel = null): array
    {
        if (false !== \array_search('administrator', $user->getRoles())) {
            return [];
        }

        $allowedChannels = $user->get('field_rendr_allowed_channels')->getValue();
        $channelIds = \array_column($allowedChannels, 'target_id');

        if (empty($channelIds) || ($channel && !\in_array($channel->id(), $channelIds))) {
            throw new AccessDeniedHttpException('You are not authorized to access this page.');
        }

        return ['channels' => $channel ? [$channel->id()] : $channelIds];
    }
}
