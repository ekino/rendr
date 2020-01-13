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
 *   id="ekino_rendr_document",
 *   label=@Translation("Document"),
 *
 *   admin_permission="administer ekino_rendr documents",
 *   base_table="ekino_rendr_document",
 *   bundle_entity_type = "ekino_rendr_template",
 *   bundle_label = @Translation("Template"),
 *   entity_keys={
 *      "id"="id",
 *      "bundle"="template",
 *      "label"="title",
 *      "published"="published",
 *      "revision"="revision_id",
 *   },
 *   handlers={
 *      "form"={
 *          "add"="Drupal\ekino_rendr\Form\UpsertDocumentForm",
 *          "edit"="Drupal\ekino_rendr\Form\UpsertDocumentForm"
 *      },
 *      "list_builder"="Drupal\ekino_rendr\Entity\DocumentListBuilder",
 *      "route_provider" = {
 *          "html"="Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *     },
 *   },
 *   label_collection=@Translation("Documents"),
 *   label_count=@PluralTranslation(
 *      singular="@count document",
 *      plural="@count documents",
 *   ),
 *   label_singular=@Translation("document"),
 *   label_plural=@Translation("documents"),
 *   links={
 *      "add-form"="/admin/config/ekino_rendr/document/add/{ekino_rendr_template}",
 *      "add-page"="/admin/config/ekino_rendr/document/add",
 *      "canonical"="/admin/config/ekino_rendr/document/{ekino_rendr_document}",
 *      "collection"="/admin/config/ekino_rendr/document",
 *      "delete-form"="/admin/config/ekino_rendr/document/{ekino_rendr_document}/delete",
 *      "edit-form"="/admin/config/ekino_rendr/document/{ekino_rendr_document}/edit"
 *   }
 * )
 */
final class Document extends RevisionableContentEntityBase implements DocumentInterface
{
    use EntityChangedTrait;
    use EntityPublishedTrait;

    const ID = 'ekino_rendr_document';

    public function getPath(): string
    {
        return \is_string($path = $this->get('path')->value) ? $path : '';
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
            ->setDisplayOptions('form', [
                'type' => 'boolean_checkbox',
            ])
            ->setDisplayConfigurable('form', true);

        return [
            'title' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Title'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true),
            'path' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Path'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true),
            'content' => BaseFieldDefinition::create('entity_reference_revisions')
                ->setLabel(new TranslatableMarkup('Content'))
                ->setRequired(true)
                ->setRevisionable(true)
                ->setSetting('target_type', 'paragraph')
                ->setCardinality(FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED)
                ->setDisplayOptions('form', [
                    'type' => 'paragraphs',
                ])
                ->setDisplayConfigurable('form', true),
            'changed' => BaseFieldDefinition::create('changed')
                ->setLabel(new TranslatableMarkup('Changed'))
                ->setRequired(true),
        ] +
            parent::baseFieldDefinitions($entityType) +
            $published;
    }
}
