<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityPublishedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * @ContentEntityType(
 *   id="ekino_rendr_page",
 *   label=@Translation("Page"),
 *
 *   translatable = TRUE,
 *   admin_permission="administer ekino_rendr pages",
 *   base_table="ekino_rendr_page",
 *   data_table = "ekino_rendr_page_field_data",
 *   revision_table = "ekino_rendr_page_revision",
 *   revision_data_table = "ekino_rendr_page_field_revision",
 *   bundle_entity_type = "ekino_rendr_template",
 *   bundle_label = @Translation("Template"),
 *   entity_keys={
 *      "id"="id",
 *      "bundle"="template",
 *      "label"="title",
 *      "langcode" = "langcode",
 *      "published"="published",
 *      "revision"="revision_id",
 *   },
 *   handlers={
 *      "form"={
 *          "default"="Drupal\Core\Entity\ContentEntityForm",
 *          "add"="Drupal\ekino_rendr\Form\PageUpsertForm",
 *          "edit"="Drupal\ekino_rendr\Form\PageUpsertForm"
 *      },
 *      "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *      "list_builder"="Drupal\ekino_rendr\Entity\PageListBuilder",
 *      "route_provider" = {
 *          "html"="Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *      },
 *     "views_data" = "Drupal\views\EntityViewsData",
 *   },
 *   label_collection=@Translation("Pages"),
 *   label_count=@PluralTranslation(
 *      singular="@count page",
 *      plural="@count pages",
 *   ),
 *   label_singular=@Translation("page"),
 *   label_plural=@Translation("pages"),
 *   field_ui_base_route="entity.ekino_rendr_template.edit_form",
 *   links={
 *      "add-form"="/admin/content/ekino_rendr_page/add/{ekino_rendr_template}",
 *      "add-page"="/admin/content/ekino_rendr_page/add",
 *      "canonical"="/admin/content/ekino_rendr_page/{ekino_rendr_page}",
 *      "collection"="/admin/content/ekino_rendr_page",
 *      "delete-form"="/admin/content/ekino_rendr_page/{ekino_rendr_page}/delete",
 *      "edit-form"="/admin/content/ekino_rendr_page/{ekino_rendr_page}/edit"
 *   }
 * )
 */
final class Page extends RevisionableContentEntityBase implements PageInterface
{
    use EntityChangedTrait;
    use EntityPublishedTrait;

    const ID = 'ekino_rendr_page';

    public function getPath(): string
    {
        return \is_string($path = $this->get('path')->value) ? $path : '';
    }

    public function getTitle(): string
    {
        return \is_string($title = $this->get('title')->value) ? $title : '';
    }

    /**
     * {@inheritdoc}
     */
    public static function baseFieldDefinitions(EntityTypeInterface $entityType)
    {
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
            'title' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Title'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true),
            'path' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Path'))
                ->setRequired(false)
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true),
            'channels' => BaseFieldDefinition::create('entity_reference')
                ->setLabel(new TranslatableMarkup('Channels'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setSetting('target_type', 'ekino_rendr_channel')
                ->setCardinality(FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED)
                ->setDisplayOptions('form', [
                    'type' => 'entity_reference_autocomplete',
                ])
                ->setDisplayConfigurable('form', true),
            'parent_page' => BaseFieldDefinition::create('entity_reference')
                ->setLabel(new TranslatableMarkup('Parent Page'))
                ->setRequired(false)
                ->setRevisionable(true)
                ->setSetting('target_type', 'ekino_rendr_page')
                ->setCardinality(1)
                ->setDisplayOptions('form', [
                    'type' => 'entity_reference_autocomplete',
                ])
                ->setDisplayConfigurable('form', true),
            'container_inheritance' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Container inheritance'))
                ->setRequired(false)
                ->setRevisionable(true)
                ->setDisplayOptions('form', [
                    'type' => 'hidden',
                ]),
            'changed' => BaseFieldDefinition::create('changed')
                ->setLabel(new TranslatableMarkup('Changed'))
                ->setRequired(true),
        ] +
            parent::baseFieldDefinitions($entityType) +
            $published;
    }

    public function createDuplicate()
    {
        $duplicate = parent::createDuplicate();
        $duplicate->set('published', false);

        return $duplicate;
    }
}
