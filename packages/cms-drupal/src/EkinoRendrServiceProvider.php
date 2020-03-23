<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\ekino_rendr\Compiler\ControllerArgumentValueResolverPass;
use Drupal\ekino_rendr\Compiler\ParagraphNormalizerExtensionPass;

class EkinoRendrServiceProvider extends ServiceProviderBase
{
    /**
     * {@inheritdoc}
     */
    public function register(ContainerBuilder $container)
    {
        $container->addCompilerPass(new ParagraphNormalizerExtensionPass());
        $container->addCompilerPass(new ControllerArgumentValueResolverPass('http_kernel.controller.argument_resolver'));
    }
}
