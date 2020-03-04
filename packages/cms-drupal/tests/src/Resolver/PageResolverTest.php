<?php

declare(strict_types=1);

namespace Drupal\Test\ekino_rendr\Resolver;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityTypeRepositoryInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\ekino_rendr\Resolver\PageResolver;
use Drupal\user\Entity\User;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;

class PageResolverTest extends TestCase
{
    /**
     * @var MockObject
     */
    protected $entityStorage;

    /**
     * @dataProvider provider
     */
    public function testGetPageConditions($params, $expected)
    {
        $this->initDrupalContainer($params['user_data']);
        if ($params['context']['request']->getSession()->get('rendr_token_owner')) {
            $this->entityStorage->expects($this->atLeastOnce())->method('load')
                ->with($params['context']['request']->getSession()->get('rendr_token_owner'));
        } else {
            $this->entityStorage->expects($this->any())->method('load')->with(null);
        }
        $pageResolver = new PageResolver(\Drupal::getContainer()->get('entity_type.manager'));
        $this->assertSame($expected, $pageResolver->getPageConditions($params['slug'], $params['context']));
    }

    public function provider()
    {
        return [
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(false, 0),
                'user_data' => [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ],
            ], [
                'path' => '/foo',
                'published' => true,
                'channels' => ['channel_id'],
            ]],
            // Add a / before the slug if not present
            [[
                'slug' => 'foo',
                'context' => $this->buildContext(false, 0),
                'user_data' => [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ],
            ], [
                'path' => '/foo',
                'published' => true,
                'channels' => ['channel_id'],
            ]],
            // Remove published status if preview mode
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, 0),
                'user_data' => [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ],
            ], [
                'path' => '/foo',
                'channels' => ['channel_id'],
            ]],
            // Test that when the session contains a token we load a user
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, 1),
                'user_data' => [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ],
            ], [
                'path' => '/foo',
                'channels' => ['channel_id'],
            ]],
            // Test that administrator has no channel restrictions
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, 0),
                'user_data' => [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['administrator'],
                ],
            ], [
                'path' => '/foo',
            ]],
            // Test that administrator token also removes channel restriction
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, 1),
                'user_data' => [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['administrator'],
                ],
            ], [
                'path' => '/foo',
            ]],
        ];
    }

    /**
     * @param bool $preview    Set preview mode
     * @param int  $tokenOwner Id of the user the token is attached to
     */
    protected function buildContext(bool $preview, int $tokenOwner): array
    {
        $context = ['preview' => $preview];
        $session = new Session(new MockArraySessionStorage());
        if ($tokenOwner) {
            $session->set('rendr_token_owner', $tokenOwner);
        }
        $request = new Request();
        $request->setSession($session);
        $context['request'] = $request;

        return $context;
    }

    protected function initDrupalContainer(array $userData)
    {
        $container = new ContainerBuilder();
        \Drupal::setContainer($container);

        $this->entityStorage = $this->createMock(EntityStorageInterface::class);

        $entityTypeRepository = $this->createMock(EntityTypeRepositoryInterface::class);
        $entityTypeManager = $this->getMockBuilder(EntityTypeManagerInterface::class)
            ->disableOriginalConstructor()
            ->getMock();
        $entityTypeManager->expects($this->any())
            ->method('getStorage')
            ->willReturn($this->entityStorage);

        $container->set('entity_type.manager', $entityTypeManager);
        $container->set('entity_type.repository', $entityTypeRepository);

        $user = $this->createMock(User::class);
        $that = $this;
        $user->expects($this->any())
            ->method('get')
            ->willReturnCallback(function ($name) use ($userData, $that) {
                $fieldItemList = $that->createMock(FieldItemListInterface::class);
                $fieldItemList->expects($this->any())
                    ->method('getValue')
                    ->willReturn($userData[$name]);

                return $fieldItemList;
            });
        $user->expects($this->any())
            ->method('getRoles')
            ->willReturn($userData['roles']);

        $this->entityStorage->expects($this->any())
            ->method('load')
            ->willReturn($user);

        $container->set('current_user', $user);
    }
}
