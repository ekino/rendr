<?php

declare(strict_types=1);

namespace Drupal\Tests\ekino_rendr\Unit\Tool;

use Drupal\ekino_rendr\Tool\ArrayHelper;
use PHPUnit\Framework\TestCase;

class ArrayHelperTest extends TestCase
{
    public function testAlterNestedKey(): void
    {
        $sample = [
            'level_1' => [
                'level_2' => [
                    'my_key' => [
                        'my_content' => 'foo',
                    ],
                ],
            ],
        ];

        $callback = function (&$value) {
            $value['my_second_content'] = 'bar';
        };

        ArrayHelper::alterNestedKey('my_key', $callback, $sample);
        $this->assertSame([
            'my_content' => 'foo',
            'my_second_content' => 'bar',
        ], $sample['level_1']['level_2']['my_key']);
    }

    public function testAlterInvalidNestedKey(): void
    {
        $sample = [
            'level_1' => [
                'level_2' => [
                    'my_key' => [
                        'my_content' => 'foo',
                    ],
                ],
            ],
        ];

        $callback = function (&$value) {};

        $this->assertFalse(ArrayHelper::alterNestedKey('my_wrong_key', $callback, $sample));
    }
}
