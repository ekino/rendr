<?php

declare(strict_types=1);

namespace Drupal\Test\ekino_rendr\Tool;

use Drupal\ekino_rendr\Tool\PreviewHelper;
use PHPUnit\Framework\TestCase;

class PreviewHelperTest extends TestCase
{
    /**
     * @dataProvider provider
     */
    public function testConvertToPreviewUrl($uri, $expected)
    {
        $this->assertSame($expected, PreviewHelper::convertToPreviewUrl($uri));
    }

    public function provider()
    {
        return [
            // Adds the trailing '/'
            ['/', '/_preview/'],
            ['/_preview/foo', '/_preview/foo'],
            ['/_preview2/foo', '/_preview2/foo'],
            ['/_preview', '/_preview'],
            ['http://my.domain.com/foo', 'http://my.domain.com/_preview/foo'],
            ['http://my.domain.com/_preview', 'http://my.domain.com/_preview'],
            ['https://my.domain.com/foo', 'https://my.domain.com/_preview/foo'],
            ['https://my.domain.com/', 'https://my.domain.com/_preview/'],
            // Adds the trailing '/'
            ['https://my.domain.com', 'https://my.domain.com/_preview/'],
        ];
    }
}
