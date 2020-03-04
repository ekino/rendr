<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Resolver;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Page resolver.
 */
class PageResolver implements PageResolverInterface
{
    protected $entityTypeManager;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager
    ) {
        $this->entityTypeManager = $entity_type_manager;
    }

    public function getPageConditions($slug, $context = [])
    {
        $resolver = new OptionsResolver();
        $resolver->setDefined('request');
        $resolver->setDefaults([
            'preview' => false,
        ]);
        $resolver->setAllowedTypes('preview', 'bool');
        $resolver->setAllowedTypes('request', Request::class);
        $resolver->setRequired('request');

        $options = $resolver->resolve($context);
        $conditions = [
            // Ensure the slug starts with a /
            'path' => 0 === \strpos($slug, '/') ? $slug : '/'.$slug,
        ];

        if (!$options['preview']) {
            $conditions['published'] = true;
        }

        $conditions = \array_merge($conditions, $this->getUserSpecificConditions($options['request']));

        return $conditions;
    }

    protected function getUserSpecificConditions(Request $request): array
    {
        $session = $request->getSession() ?? new Session();

        if ($session->get('rendr_token_owner')) {
            $user = $this->entityTypeManager->getStorage('user')->load($session->get('rendr_token_owner'));
        } else {
            $user = User::load(\Drupal::currentUser()->id());
        }

        if (false !== \array_search('administrator', $user->getRoles())) {
            return [];
        }

        $allowedChannels = $user->get('field_rendr_allowed_channels')->getValue();
        $channelIds = \array_column($allowedChannels, 'target_id');

        if (empty($channelIds)) {
            throw new AccessDeniedHttpException('You are not authorized to access this page.');
        }

        return ['channels' => $channelIds];
    }
}
