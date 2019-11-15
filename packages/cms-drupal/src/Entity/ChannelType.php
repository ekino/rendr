<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBundleBase;

/**
 * @ConfigEntityType(
 *   id="ekino_rendr_channel_type",
 *   label=@Translation("Channel type"),
 *
 *   admin_permission="administer ekino_rendr channel types",
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
 *          "add"="Drupal\ekino_rendr\Form\UpsertChannelTypeForm",
 *          "edit"="Drupal\ekino_rendr\Form\UpsertChannelTypeForm"
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
 *      "add-form"="/admin/config/ekino_rendr/channel_type/add",
 *      "canonical"="/admin/config/ekino_rendr/channel_type/{ekino_rendr_channel_type}",
 *      "collection"="/admin/config/ekino_rendr/channel_type",
 *      "delete-form"="/admin/config/ekino_rendr/channel_type/{ekino_rendr_channel_type}/delete",
 *      "edit-form"="/admin/config/ekino_rendr/channel_type/{ekino_rendr_channel_type}/edit"
 *   }
 * )
 */
final class ChannelType extends ConfigEntityBundleBase
{
    const ID = 'ekino_rendr_channel_type';
}
