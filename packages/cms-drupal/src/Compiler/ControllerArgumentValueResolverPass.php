<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Compiler\PriorityTaggedServiceTrait;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class ControllerArgumentValueResolverPass implements CompilerPassInterface
{
    use PriorityTaggedServiceTrait;

    private $argumentResolverService;
    private $argumentValueResolverTag;

    public function __construct($argumentResolverService = 'argument_resolver', $argumentValueResolverTag = 'controller.argument_value_resolver')
    {
        $this->argumentResolverService = $argumentResolverService;
        $this->argumentValueResolverTag = $argumentValueResolverTag;
    }

    public function process(ContainerBuilder $container)
    {
        if (!$container->hasDefinition($this->argumentResolverService)) {
            return;
        }

        $container
            ->getDefinition($this->argumentResolverService)
            ->replaceArgument(1,
                \array_merge(
                    $this->findAndSortTaggedServices($this->argumentValueResolverTag, $container),
                    $container->getDefinition($this->argumentResolverService)->getArgument(1)
                ));
    }
}
