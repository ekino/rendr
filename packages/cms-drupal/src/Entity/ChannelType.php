<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBundleBase;

/**
 * @ConfigEntityType(
 *   id="ekino_rendr_channel_type",
 *   label=@Translation("Channel type"),
 *
 *   admin_permission="administer ekino_rendr_channel_type",
 *   bundle_of="ekino_rendr_channel",
 *   config_export={
 *      "id",
 *      "label"
 *   },
 *   entity_keys={
 *      "id"="id",
 *      "label"="label"
 *   },
 *   handlers={
 *      "form"={
 *          "add"="Drupal\ekino_rendr\Form\ChannelTypeUpsertForm",
 *          "edit"="Drupal\ekino_rendr\Form\ChannelTypeUpsertForm"
 *      },
 *      "list_builder"="Drupal\ekino_rendr\Entity\ChannelTypeListBuilder",
 *      "route_provider" = {
 *          "html"="Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *      },
 *   },
 *   label_collection=@Translation("Channel types"),
 *   label_count=@PluralTranslation(
 *      singular="@count channel type",
 *      plural="@count channel types",
 *   ),
 *   label_singular=@Translation("channel type"),
 *   label_plural=@Translation("channel types"),
 *   links={
 *      "add-form"="/admin/structure/ekino_rendr/channel_type/add",
 *      "canonical"="/admin/structure/ekino_rendr/channel_type/{ekino_rendr_channel_type}",
 *      "collection"="/admin/structure/ekino_rendr/channel_type",
 *      "delete-form"="/admin/structure/ekino_rendr/channel_type/{ekino_rendr_channel_type}/delete",
 *      "edit-form"="/admin/structure/ekino_rendr/channel_type/{ekino_rendr_channel_type}/edit"
 *   }
 * )
 */
final class ChannelType extends ConfigEntityBundleBase implements ChannelTypeInterface
{
    const ID = 'ekino_rendr_channel_type';
}
