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
use Drupal\ekino_rendr\Repository\PageRepository;

/**
 * @ContentEntityType(
 *   id="ekino_rendr_page",
 *   label=@Translation("Page"),
 *
 *   translatable = TRUE,
 *   admin_permission="administer ekino_rendr_page",
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
 *          "delete"="Drupal\Core\Entity\ContentEntityDeleteForm",
 *          "edit"="Drupal\ekino_rendr\Form\PageUpsertForm"
 *      },
 *      "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *      "views_data" = "Drupal\ekino_rendr\ViewsData\PageViewsData",
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
        return $this->getStringFieldValue('path');
    }

    public function getUrlAlias(): string
    {
        return $this->getStringFieldValue('url_alias');
    }

    public function getDefaultPath(): string
    {
        return $this->getUrlAlias() ?: $this->getPath();
    }

    public function getTitle(): string
    {
        return $this->getStringFieldValue('title');
    }

    public function isDisplayable(): bool
    {
        return !empty($this->getPath()) && false === \strpos($this->getPath(), ':');
    }

    public function isDynamic(): bool
    {
        return !$this->isDisplayable();
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
                ->setTranslatable(false)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true)
                ->setDescription(new TranslatableMarkup('Specify the base path by which the data are retrieved. This path is used to determine page hierarchy in the breadcrumb. Use url alias to specify a user friendly url for the page.')),
            'url_alias' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('Url Alias'))
                ->setRequired(false)
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true)
                ->setDescription(new TranslatableMarkup('Specify an alternative path by which this data can be accessed. For example, type "/about" when writing an about page.')),
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
            'ttl' => BaseFieldDefinition::create('integer')
                ->setLabel(new TranslatableMarkup('TTL'))
                ->setDescription(new TranslatableMarkup('How long the page should be stored in cache. In seconds.'))
                ->setRequired(false)
                ->setRevisionable(false)
                ->setDisplayOptions('form', [
                    'type' => 'number',
                ]),
            'changed' => BaseFieldDefinition::create('changed')
                ->setLabel(new TranslatableMarkup('Changed'))
                ->setRequired(true),
            'seo_title' => BaseFieldDefinition::create('string')
                ->setLabel(new TranslatableMarkup('SEO Title'))
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textfield',
                ])
                ->setDisplayConfigurable('form', true)
                ->setDescription(new TranslatableMarkup('Title to display in the meta of the page.')),
            'seo_description' => BaseFieldDefinition::create('string_long')
                ->setLabel(new TranslatableMarkup('SEO Description'))
                ->setRevisionable(true)
                ->setTranslatable(true)
                ->setDisplayOptions('form', [
                    'type' => 'string_textarea',
                    'settings' => [
                        'rows' => 3,
                    ],
                ])
                ->setDescription(new TranslatableMarkup('Used for page meta and content share.')),
        ] +
            parent::baseFieldDefinitions($entityType) +
            $published;
    }

    public function createDuplicate()
    {
        $duplicate = parent::createDuplicate();
        $duplicate->set('published', false);
        $this->duplicateParagraphs($duplicate);

        foreach ($duplicate->getTranslationLanguages() as $langcode => $language) {
            $translation = $duplicate->getTranslation($langcode);
            $translation->set('published', false);
            $this->duplicateParagraphs($translation);
        }

        return $duplicate;
    }

    public function getTtl(ChannelInterface $channel = null)
    {
        $default = $channel ? $channel->getPrivateSetting('default_ttl', 0) : 0;

        return (int) (\is_numeric($this->get('ttl')->value) ? $this->get('ttl')->value : $default);
    }

    public function getSimilarPages()
    {
        /** @var PageRepository $repository */
        $repository = \Drupal::getContainer()->get('ekino_rendr.repository.page');

        return $repository->getSimilarPages($this);
    }

    public function getHierarchicalParentPage()
    {
        /** @var PageRepository $repository */
        $repository = \Drupal::getContainer()->get('ekino_rendr.repository.page');
        $pages = $repository->getHierarchicalParentPage($this);

        return \reset($pages);
    }

    public function getSameHierarchicalPages($includeCurrent = false)
    {
        /** @var PageRepository $repository */
        $repository = \Drupal::getContainer()->get('ekino_rendr.repository.page');

        return $repository->getSameHierarchicalPages($this, $includeCurrent);
    }

    public function getChildrenHierarchicalPages()
    {
        /** @var PageRepository $repository */
        $repository = \Drupal::getContainer()->get('ekino_rendr.repository.page');

        return $repository->getChildrenHierarchicalPages($this);
    }

    protected function getStringFieldValue($fieldName)
    {
        return \is_string($this->get($fieldName)->value) ? $this->get($fieldName)->value : '';
    }

    protected function duplicateParagraphs(PageInterface $page)
    {
        foreach ($page->getFieldDefinitions() as $field_definition) {
            $field_storage_definition = $field_definition->getFieldStorageDefinition();
            $field_settings = $field_storage_definition->getSettings();
            $field_name = $field_storage_definition->getName();
            if (isset($field_settings['target_type']) && 'paragraph' == $field_settings['target_type']) {
                if (!$page->get($field_name)->isEmpty()) {
                    foreach ($page->get($field_name) as $value) {
                        if ($value->entity) {
                            $value->entity = $value->entity->createDuplicate();
                        }
                    }
                }
            }
        }
    }
}
