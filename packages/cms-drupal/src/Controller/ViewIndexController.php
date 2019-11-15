<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Controller;

use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;

final class ViewIndexController
{
    private $translation;

    public function __construct(TranslationInterface $translation)
    {
        $this->translation = $translation;
    }

    public function __invoke(): array
    {
        return [
            '#title' => 'ekino rendr',
            '#theme' => 'admin_block_content',
            '#content' => [
                [
                    'url' => new Url('entity.ekino_rendr_template.collection'),
                    'title' => $this->translation->translate('Manage templates'),
                ],
                [
                    'url' => new Url('entity.ekino_rendr_channel.collection'),
                    'title' => $this->translation->translate('Manage channels'),
                ],
                [
                    'url' => new Url('entity.ekino_rendr_channel_type.collection'),
                    'title' => $this->translation->translate('Manage channel types'),
                ],
            ],
        ];
    }
}
