<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Resolver;

use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Page resolver.
 */
class PageResolver implements PageResolverInterface
{
    public function getPageConditions($slug, $context = [])
    {
        $resolver = new OptionsResolver();
        $resolver->setDefaults([
            'preview' => false,
            'allowed_channels' => [],
        ]);
        $resolver->setAllowedTypes('preview', 'bool');
        $resolver->setAllowedTypes('allowed_channels', 'array');

        $options = $resolver->resolve($context);
        $conditions = [
            // Ensure the slug starts with a /
            'path' => 0 === \strpos($slug, '/') ? $slug : '/'.$slug,
        ];

        if (!$options['preview']) {
            $conditions['published'] = true;
        }

        // @TODO check against page's channel
        if (\count($options['allowed_channels'])) {
//            $conditions['channel'] = [1];
        }

        return $conditions;
    }
}
