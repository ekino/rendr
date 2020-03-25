<?php

declare(strict_types=1);

namespace Drupal\Test\ekino_rendr\Resolver;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\ekino_rendr\Entity\Channel;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Resolver\PageResolver;
use Drupal\user\Entity\User;
use PHPUnit\Framework\TestCase;

class PageResolverTest extends TestCase
{
    /**
     * @dataProvider provider
     */
    public function testGetPageConditions($params, $expected)
    {
        $pageResolver = new PageResolver();
        $this->assertSame($expected, $pageResolver->getPageConditions($params['slug'], $params['context']));
    }

    public function provider()
    {
        return [
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(false, [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ]),
            ], [
                'path' => '/foo',
                'published' => true,
            ]],
            // Add a / before the slug if not present
            [[
                'slug' => 'foo',
                'context' => $this->buildContext(false, [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ]),
            ], [
                'path' => '/foo',
                'published' => true,
            ]],
            // In preview mode, we remove the publication condition
            // but restrict access depending on the user permissions
            // and channels
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['not administrator'],
                ]),
            ], [
                'path' => '/foo',
                'channels' => ['channel_id'],
            ]],
            // Test that administrator has no channel restrictions
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id']],
                    'roles' => ['administrator'],
                ]),
            ], [
                'path' => '/foo',
            ]],
            // If a channel is provided, the restriction is applied regardless of the context
            [[
                'slug' => '/foo',
                'context' => $this->buildContext(true, [
                    'field_rendr_allowed_channels' => [['target_id' => 'channel_id'], ['target_id' => 'channel_id_2']],
                    'roles' => ['administrator'],
                ],
                    'an_id'),
            ], [
                'path' => '/foo',
                'channels' => ['an_id'],
            ]],
        ];
    }

    /**
     * @param bool   $preview   Set preview mode
     * @param array  $userData  The data to attach to the user
     * @param string $channelId A channel id. if null, no channel is returned
     */
    protected function buildContext(bool $preview, array $userData, $channelId = null): array
    {
        $channel = $this->createMock(ChannelInterface::class);
        $channel->expects($this->any())
            ->method('id')
            ->willReturn($channelId);
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

        $result = [
            'preview' => $preview,
            'user' => $user,
        ];

        if ($channelId) {
            $result['channel'] = $channel;
        }

        return $result;
    }
}
