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
 *      "uuid" = "uuid",
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
 *          "delete"="Drupal\Core\Entity\ContentEntityDeleteForm",
 *          "edit"="Drupal\ekino_rendr\Form\ChannelUpsertForm"
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

    private $publicSettings = null;
    private $privateSettings = null;

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
            'private_settings' => BaseFieldDefinition::create('string_long')
                    ->setLabel(new TranslatableMarkup('Private Settings'))
                    ->setRevisionable(false)
                    ->setTranslatable(false)
                    ->setDisplayOptions('form', [
                        'type' => 'string_textarea',
                        'settings' => [
                            'rows' => 5,
                        ],
                    ])
                    ->setDescription(new TranslatableMarkup('Internal settings. Enter one value per line, in the format key=value.')),
            'public_settings' => BaseFieldDefinition::create('string_long')
                ->setLabel(new TranslatableMarkup('Public Settings'))
                ->setRevisionable(false)
                ->setTranslatable(false)
                ->setDisplayOptions('form', [
                    'type' => 'string_textarea',
                    'settings' => [
                        'rows' => 5,
                    ],
                ])
                ->setDescription(new TranslatableMarkup('Publicly exposed settings. Enter one value per line, in the format key=value.')),
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

    /**
     * Extracts the values array from the setting field.
     *
     * @param string $string
     *                       The raw string to extract values from
     *
     * @return array
     *               The first element is the list of valid values
     *               The second element contains the indexes of wrongly formatted lines
     */
    public static function extractSettingValues($string)
    {
        $values = [];
        $errors = [];

        $list = \explode("\n", $string);
        $list = \array_map('trim', $list);
        $list = \array_filter($list, 'strlen');

        foreach ($list as $position => $text) {
            // Check for an explicit key.
            $matches = [];
            if (\preg_match('/(.*)=(.*)/', $text, $matches)) {
                // Trim key and value to avoid unwanted spaces issues.
                $key = \trim($matches[1]);
                $value = \trim($matches[2]);
                $values[$key] = $value;
            } else {
                $errors[] = $position;
            }
        }

        return [$values, $errors];
    }

    public function createDuplicate()
    {
        $duplicate = parent::createDuplicate();

        foreach ($duplicate->getTranslationLanguages(true) as $langcode => $language) {
            $translation = $duplicate->getTranslation($langcode);
            $translation->set('label', $translation->get('label')->value.' - DUPLICATE');
            $translation->set('locale', $translation->get('locale')->value.' - DUPLICATE');
        }

        return $duplicate;
    }

    public function getPublicSettings(): array
    {
        if (null === $this->settings) {
            $this->publicSettings = \is_string($settings = $this->get('public_settings')->value) ? self::extractSettingValues($settings)[0] : [];
        }

        return $this->publicSettings;
    }

    public function getPrivateSettings(): array
    {
        if (null === $this->settings) {
            $this->privateSettings = \is_string($settings = $this->get('private_settings')->value) ? self::extractSettingValues($settings)[0] : [];
        }

        return $this->privateSettings;
    }

    public function getPublicSetting($key, $default = null)
    {
        $settings = $this->getPublicSettings();

        return \array_key_exists($key, $settings) ? $settings[$key] : $default;
    }

    public function getPrivateSetting($key, $default = null)
    {
        $settings = $this->getPrivateSettings();

        return \array_key_exists($key, $settings) ? $settings[$key] : $default;
    }
}
