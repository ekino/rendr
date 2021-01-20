<?php

declare(strict_types=1);

namespace Drupal\Tests\ekino_rendr\Unit\Tool;

use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Tool\UrlGenerator;
use PHPUnit\Framework\TestCase;

class UrlGeneratorTest extends TestCase
{
    /**
     * @dataProvider provider
     */
    public function testGetBaseUrl($expected, $channel, $options)
    {
        $this->assertSame($expected, UrlGenerator::getBaseUrl($channel, $options));
    }

    public function provider()
    {
        $channel = $this->createMock(ChannelInterface::class);
        $obj = new \stdClass();
        $obj->value = 'www.my-domain.com';
        $channel->expects($this->any())->method('get')->willReturn($obj);

        return [
            ['http://www.my-domain.com', $channel, []],
            ['https://www.my-domain.com', $channel, ['https' => true]],
            ['http://www.foo.bar', $channel, ['base_url' => 'www.foo.bar']],
        ];
    }
}
