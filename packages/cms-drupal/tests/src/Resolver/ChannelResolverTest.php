<?php

declare(strict_types=1);

namespace Drupal\Test\ekino_rendr\Resolver;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Resolver\ChannelResolver;
use PHPUnit\Framework\TestCase;

class ChannelResolverTest extends TestCase
{
    /**
     * @dataProvider provider
     */
    public function testFindMatchingChannels($params, $expected)
    {
        $channels = [
            $this->createChannelMock('foo', 'www.foo.com', ''),
            $this->createChannelMock('foo with locale', 'www.foo.com', '/en'),
            $this->createChannelMock('bar', 'www.bar.com', '/'),
            $this->createChannelMock('bar with locale', 'www.bar.com', 'fr'),
        ];

        $matching = ChannelResolver::findMatchingChannels($channels, $params['domain'], $params['path']);

        $this->assertSame($expected, \array_map(static function ($match) {
            return $match->id();
        }, $matching));
    }

    public function provider()
    {
        return [
            [
                ['domain' => '', 'path' => '/'],
                [],
            ],
            [
                ['domain' => 'www.foo.com', 'path' => '/'],
                ['foo'],
            ],
            [
                ['domain' => 'www.foo.com', 'path' => '/en-gb'],
                ['foo'],
            ],
            [
                ['domain' => 'www.foo.com', 'path' => '/en/gb'],
                ['foo with locale', 'foo'],
            ],
            [
                ['domain' => 'www.bar.com', 'path' => '/en/gb'],
                ['bar'],
            ],
            [
                ['domain' => 'www.bar.com', 'path' => '/fr/gb'],
                ['bar with locale', 'bar'],
            ],
        ];
    }

    protected function createChannelMock($id, $domain, $path, $translations = [])
    {
        $channel = $this->createMock(ChannelInterface::class);

        if (empty($translations)) {
            $translations['en'] = $channel;
        }

        $channel->expects($this->any())
            ->method('id')
            ->willReturn($id);
        $channel->expects($this->any())
            ->method('get')
            ->willReturnCallback(function ($key) use ($domain, $path) {
                $field = new \StdClass();

                switch ($key) {
                    case 'domain':
                        $field->value = $domain;
                        break;
                    case 'path':
                        $field->value = $path;
                        break;
                    default:
                        $field->value = null;
                        break;
                }

                return $field;
            });

        $channel->expects($this->any())
            ->method('getTranslationLanguages')
            ->willReturn(\array_combine(\array_keys($translations), \array_keys($translations)));
        $channel->expects($this->any())
            ->method('getTranslation')
            ->willReturnCallback(function ($langcode) use ($translations) {
                return $translations[$langcode];
            });

        return $channel;
    }
}
