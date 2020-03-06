<?php

declare(strict_types=1);

namespace Drupal\Test\ekino_rendr\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\ekino_rendr\Access\PreviewAccessCheck;
use Drupal\user\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;

class PreviewAccessCheckTest extends TestCase
{
    /**
     * @dataProvider provider
     */
    public function testAccess($params, $expected)
    {
        $account = $this->createMock(AccountInterface::class);
        $account->expects($this->any())
            ->method('hasPermission')
            ->with('view ekino_rendr pages')
            ->willReturn($params['account_permission']);

        $session = new Session(new MockArraySessionStorage());

        if ($params['session_token']) {
            $session->set('rendr_token_owner', $params['session_token']);
        }

        $request = new Request($params['request_query']);
        $request->setSession($session);

        $entityStorage = $this->createMock(EntityStorageInterface::class);
        $entityStorage->expects($this->any())
            ->method('loadByProperties')
            ->willReturn($params['users']);
        $entityTypeManager = $this->getMockBuilder(EntityTypeManagerInterface::class)
            ->disableOriginalConstructor()
            ->getMock();
        $entityTypeManager->expects($this->any())
            ->method('getStorage')
            ->willReturn($entityStorage);

        $previewAccessCheck = new PreviewAccessCheck($entityTypeManager);
        $this->assertEquals($expected, $previewAccessCheck->access($account, $request));
    }

    public function provider()
    {
        $user = $this->createMock(User::class);
        $user->expects($this->exactly(1))
            ->method('hasPermission')
            ->with('view ekino_rendr pages')
            ->willReturn(true);

        return [
            [
                // account is allowed to view pages
                [
                    'account_permission' => true,
                    'session_token' => null,
                    'request_query' => [],
                    'users' => [],
                ],
                AccessResult::allowed(),
            ],
            [
                // account is not allowed to view pages
                [
                    'account_permission' => false,
                    'session_token' => null,
                    'request_query' => [],
                    'users' => [],
                ],
                AccessResult::forbidden(),
            ],
            [
                // account is not allowed. user token is provided in session
                [
                    'account_permission' => false,
                    'session_token' => 1,
                    'request_query' => [],
                    'users' => [],
                ],
                AccessResult::allowed(),
            ],
            [
                // account is not allowed. user token is provided in url
                // but no user matches the token
                [
                    'account_permission' => false,
                    'session_token' => null,
                    'request_query' => ['_preview_token' => 'something'],
                    'users' => [],
                ],
                AccessResult::forbidden(),
            ],
            [
                // account is not allowed. user token is provided in url
                // but too many users match the token
                [
                    'account_permission' => false,
                    'session_token' => null,
                    'request_query' => ['_preview_token' => 'something'],
                    'users' => [
                        $this->createMock(User::class),
                        $this->createMock(User::class),
                    ],
                ],
                AccessResult::forbidden(),
            ],
            [
                // account is not allowed. user token is provided in url
                // and one user matches but this user doesn't have the right permission
                [
                    'account_permission' => false,
                    'session_token' => null,
                    'request_query' => ['_preview_token' => 'something'],
                    'users' => [
                        $this->createMock(User::class),
                    ],
                ],
                AccessResult::forbidden(),
            ],
            [
                // account is not allowed. user token is provided in url
                // and one user matches and has permission
                [
                    'account_permission' => false,
                    'session_token' => null,
                    'request_query' => ['_preview_token' => 'something'],
                    'users' => [$user],
                ],
                AccessResult::allowed(),
            ],
        ];
    }
}
