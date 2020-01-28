<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Compiler;

use Drupal\ekino_rendr\Normalizer\ParagraphFieldNormalizer;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ParagraphNormalizerExtensionPass implements CompilerPassInterface
{
    /**
     * {@inheritdoc}
     */
    public function process(ContainerBuilder $container)
    {
        if (!$container->has(ParagraphFieldNormalizer::class)) {
            return;
        }

        $definition = $container->findDefinition(ParagraphFieldNormalizer::class);
        $taggedServices = $container->findTaggedServiceIds('ekino_rendr.paragraph_normalizer');

        foreach ($taggedServices as $id => $tags) {
            // add the transport service to the TransportChain service
            $definition->addMethodCall('addNormalizer', [new Reference($id)]);
        }
    }
}
