<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Converter;

use Drupal\ekino_rendr\Entity\PageInterface;

class TemplateConverter
{
    public static function convertPageTemplate(PageInterface $page, $from, $to)
    {
        $entityFieldManager = \Drupal::service('entity_field.manager');
        $oldFields = $entityFieldManager->getFieldDefinitions('ekino_rendr_page', $from);
        $newFields = $entityFieldManager->getFieldDefinitions('ekino_rendr_page', $to);

        $fieldsToAdd = \array_diff_key($newFields, $oldFields);
        $fieldsToRemove = \array_diff_key($oldFields, $newFields);
        \Drupal::logger('ekino_rendr')->debug('<p>Page @id will receive the following changes:</p>
<ul>
  <li>Update from @old_template to @new_template</li>
  <li>Field added: @addedFields</li>
  <li>Field removed: @removedFields</li>
</ul>', [
            '@id' => $page->id(),
            '@old_template' => $from,
            '@new_template' => $to,
            '@addedFields' => \implode(', ', \array_keys($fieldsToAdd)),
            '@removedFields' => \implode(', ', \array_keys($fieldsToRemove)),
        ]);

        return self::convertTemplate(self::getBaseTableNames('ekino_rendr_page'), $page, $to);
    }

    private static function getBaseTableNames($entityType)
    {
        $storage = \Drupal::service('entity_type.manager')->getStorage($entityType);
        // Get the names of the base tables.
        $baseTableNames = [];
        $baseTableNames[] = $storage->getBaseTable();
        if (!empty($storage->getDataTable())) {
            $baseTableNames[] = $storage->getDataTable();
        }

        return $baseTableNames;
    }

    private static function convertTemplate($tableNames, PageInterface $page, $to)
    {
        $page->set('template', $to);

        return $page->save();
    }
}
