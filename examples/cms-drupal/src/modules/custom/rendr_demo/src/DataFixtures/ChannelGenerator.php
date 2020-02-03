<?php

namespace Drupal\rendr_demo\DataFixtures;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\data_fixtures\Interfaces\Generator;
use Drupal\ekino_rendr\Entity\ChannelType;
use Drupal\ekino_rendr\Entity\Channel;

final class ChannelGenerator implements Generator
{
    private $entityTypeManager;

    public function __construct(EntityTypeManagerInterface $entity_type_manager)
    {
        $this->entityTypeManager = $entity_type_manager;
    }

    /**
     * {@inheritdoc}
     */
    public function load(): void
    {
        $channels = $this->entityTypeManager->getStorage('ekino_rendr_channel')->loadByProperties([
            'label' => 'Main',
        ]);

        if (count($channels) > 0) {
            // Channel already exists
            return;
        }

        $channel_types = $this->entityTypeManager->getStorage('ekino_rendr_channel_type')->loadByProperties();

        if (count($channel_types) === 0) {
            $channel_type = ChannelType::create([
                'id' => 1,
                'label' => 'Main Channel Type',
            ]);

            $channel_type->enforceIsNew();
            $channel_type->save();
        } else {
            $channel_type = reset($channel_types);
        }

        $channel = Channel::create([
            'channel_type' => $channel_type->id,
            'label' => 'Main',
        ]);

        $channel->setOwnerId(1);
        $channel->setPublished(true);

        $channel->enforceIsNew();
        $channel->save();
    }

    /**
     * {@inheritdoc}
     */
    public function unLoad(): void
    {
        foreach (['ekino_rendr_channel', 'ekino_rendr_channel_type'] as $name) {
            $storage = $this->entityTypeManager->getStorage($name);

            $storage->delete($storage->loadMultiple());
        }
    }
}
