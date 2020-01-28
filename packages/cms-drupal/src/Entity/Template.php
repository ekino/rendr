<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBundleBase;
use Drupal\ekino_rendr\Model\Container;

/**
 * @ConfigEntityType(
 *   id="ekino_rendr_template",
 *   label=@Translation("Template"),
 *
 *   admin_permission="administer ekino_rendr templates",
 *   bundle_of="ekino_rendr_page",
 *   config_export={
 *      "id",
 *      "label",
 *      "containers"
 *   },
 *   entity_keys={
 *      "id"="id",
 *      "label"="label",
 *   },
 *   handlers={
 *      "list_builder"="Drupal\ekino_rendr\Entity\TemplateListBuilder",
 *      "route_provider" = {
 *          "html"="Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *      },
 *   },
 *   label_collection=@Translation("Templates"),
 *   label_count=@PluralTranslation(
 *      singular="@count template",
 *      plural="@count templates",
 *   ),
 *   label_singular=@Translation("template"),
 *   label_plural=@Translation("templates"),
 *   links={
 *      "add-form"="/admin/structure/ekino_rendr/template/add",
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
