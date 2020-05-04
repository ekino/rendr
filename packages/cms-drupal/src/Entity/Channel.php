<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Component\Uuid\Php;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityPublishedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\user\EntityOwnerInterface;
use Drupal\user\EntityOwnerTrait;

/**
 * @ContentEntityType(
 *   id="ekino_rendr_channel",
 *   label=@Translation("Channel"),
 *
 *   translatable = TRUE,
 *   admin_permission="administer ekino_rendr channels",
 *   base_table="ekino_rendr_channel",
 *   data_table = "ekino_rendr_channel_field_data",
 *   revision_table = "ekino_rendr_channel_revision",
 *   revision_data_table = "ekino_rendr_channel_field_revision",
 *   bundle_entity_type = "ekino_rendr_channel_type",
 *   bundle_label = @Translation("Channel type"),
 *   entity_keys={
 *      "id"="id",
 *      "bundle"="channel_type",
 *      "label"="label",
 *      "langcode" = "langcode",
 *      "published"="published",
 *      "revision"="revision_id",
 *      "owner" = "uid",
 *   },
 *   field_ui_base_route="entity.ekino_rendr_channel_type.edit_form",
 *   handlers={
 *      "form"={
 *          "add"="Drupal\ekino_rendr\Form\ChannelUpsertForm",
 *          "edit"="Drupal\ekino_rendr\Form\ChannelUpsertForm"
 *          "duplicate"="Drupal\ekino_rendr\Form\ChannelDuplicateForm"
 *      },
 *      "list_builder"="Drupal\ekino_rendr\Entity\ChannelListBuilder",
 *      "route_provider" = {
 *          "html"="Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *     },
 *   },
 *   label_collection=@Translation("Channels"),
 *   label_count=@PluralTranslation(
 *      singular="@count channel",
 *      plural="@count channels",
 *   ),
 *   label_singular=@Translation("channel"),
 *   label_plural=@Translation("channels"),
 *   links={
 *      "add-form"="/admin/structure/ekino_rendr/channel/add/{ekino_rendr_channel_type}",
 *      "add-page"="/admin/structure/ekino_rendr/channel/add",
 *      "canonical"="/admin/structure/ekino_rendr/channel/{ekino_rendr_channel}",
 *      "collection"="/admin/structure/ekino_rendr/channel",
 *      "delete-form"="/admin/structure/ekino_rendr/channel/{ekino_rendr_channel}/delete",
 *      "edit-form"="/admin/structure/ekino_rendr/channel/{ekino_rendr_channel}/edit"
 *   }
 * )
 */
final class Channel extends RevisionableContentEntityBase implements EntityOwnerInterface, ChannelInterface
{
    use EntityChangedTrait;
    use EntityPublishedTrait;
    use EntityOwnerTrait;

    const ID = 'ekino_rendr_channel';

    /**
     * {@inheritdoc}
     */
    public static function baseFieldDefinitions(EntityTypeInterface $entityType)
    {
        // TODO : db constraints not null + unique

        $published = self::publishedBaseFieldDefinitions($entityType);
        $published[$entityType->getKey('published')]
            ->setRevisionable(true)
            ->setDefaultValue(false)
            ->setTranslatable(true)
            ->setDisplayOptions('form', [
                'type' => 'boolean_checkbox',
            ])
            ->setDisplayConfigurable('form', true);

        return [
            'label' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Label'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true),
            'key' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Key'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setDefaultValueCallback(__CLASS__.'::getDefaultKeyValue')
                ->addConstraint('UniqueField')
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true),
            'domain' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Domain'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDescription(new TranslatableMarkup('The domain name associated to this channel. e.g. www.example.com'))
                ->setDisplayConfigurable('form', true),
            'locale' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Locale'))
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDescription(new TranslatableMarkup('The locale prefix associated to this channel. e.g. en-gb'))
                ->setDisplayConfigurable('form', true),
            'changed' => BaseFieldDefinition::create('changed')
                ->setLabel(new TranslatableMarkup('Changed'))
                ->setRequired(true),
        ] +
            parent::baseFieldDefinitions($entityType) +
            self::ownerBaseFieldDefinitions($entityType) +
            $published;
    }

    public static function getDefaultKeyValue(): string
    {
        return (new Php())->generate();
    }

    public function createDuplicate()
    {
        $duplicate = parent::createDuplicate();

        $duplicate->set('key', self::getDefaultKeyValue());
        $duplicate->set('title', $duplicate->get('title')->value.' - DUPLICATE');
        $duplicate->set('locale', $duplicate->get('locale')->value.' - DUPLICATE');

        return $duplicate;
    }
}
