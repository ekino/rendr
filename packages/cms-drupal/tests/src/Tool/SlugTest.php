<?php

declare(strict_types=1);

namespace Drupal\Tests\ekino_rendr\Unit\Tool;

use Drupal\ekino_rendr\Tool\Slug;
use Drupal\Tests\UnitTestCase;

class SlugTest extends UnitTestCase
{
    public function testSlugify(): void
    {
        $this->assertSame('test', Slug::slugify('Test '));
        $this->assertSame('foo-bar', Slug::slugify('Foo\' Bar'));
        $this->assertSame('foo-bar-123', Slug::slugify('Foo & Bar 123'));
        $this->assertSame('agriculture-parametric', Slug::slugify('Agriculture & Parametric'));
        $this->assertSame('aviation-xl', Slug::slugify('Aviation - XL'));
        $this->assertSame('securite', Slug::slugify('Sécurité'));
    }
}
