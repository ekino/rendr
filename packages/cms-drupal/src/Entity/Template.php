<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBundleBase;
use Drupal\ekino_rendr\Model\Container;

/**
 * @ConfigEntityType(
 *   id="ekino_rendr_template",
 *   label=@Translation("Page Template"),
 *   label_collection=@Translation("Page Templates"),
 *   label_count=@PluralTranslation(
 *      singular="@count Page Template",
 *      plural="@count Page Templates",
 *   ),
 *   label_singular=@Translation("Page Template"),
 *   label_plural=@Translation("Page Templates"),
 *   handlers={
 *      "list_builder"="Drupal\ekino_rendr\Entity\TemplateListBuilder",
 *      "route_provider" = {
 *          "html"="Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *      },
 *     "form" = {
 *       "add" = "Drupal\ekino_rendr\Form\TemplateForm",
 *       "edit" = "Drupal\ekino_rendr\Form\TemplateForm",
 *       "delete" = "Drupal\ekino_rendr\Form\TemplateDeleteConfirm"
 *     }
 *   },
 *   config_prefix = "ekino_rendr_template",
 *   admin_permission="administer ekino_rendr templates",
 *   entity_keys={
 *      "id"="id",
 *      "label"="label",
 *   },
 *   config_export={
 *      "id",
 *      "label",
 *      "containers"
 *   },
 *   bundle_of="ekino_rendr_page",
 *   links={
 *      "add-form"="/admin/structure/ekino_rendr/template/add",
 *      "edit-form" = "/admin/structure/ekino_rendr/template/{ekino_rendr_template}",
 *      "collection"="/admin/structure/ekino_rendr/template",
 *   }
 * )
 */
final class Template extends ConfigEntityBundleBase implements TemplateInterface
{
    const ID = 'ekino_rendr_template';

    /**
     * @return Container[]
     */
    public function getContainers()
    {
        $containers = $this->get('containers');
        if (!\is_array($containers)) {
            return [];
        }

        return \array_map(static function ($row): Container {
            return new Container($row['id'], $row['label']);
        }, $containers);
    }
}
