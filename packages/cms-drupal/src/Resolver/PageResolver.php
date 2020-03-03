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
        ]);
        $options = $resolver->resolve($context);
        $conditions = [
            // Ensure the slug starts with a /
            'path' => strpos($slug, '/') === 0 ? $slug : '/' . $slug,
        ];

        if (!$options['preview']) {
            $conditions['published'] = true;
        }

        return $conditions;
    }
}
