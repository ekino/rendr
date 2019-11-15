<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Model;

final class Container
{
    private $id;
    private $label;

    public function __construct(string $id, string $label)
    {
        $this->id = $id;
        $this->label = $label;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getLabel(): string
    {
        return $this->label;
    }
}
