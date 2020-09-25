<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Model;

class PageFormTemplate
{
    public static function getPreviewTable(array $rows)
    {
        return '<h4>Preview Urls</h4>'.
            '<table>'.
            '<thead>'.
            '<tr>'.
            '<th>Channel</th>'.
            '<th>Url</th>'.
            '</tr>'.
            '</thead>'.
            '<tbody>'.
            \implode('', \array_map(function ($tr) {
                if (empty($tr[1])) {
                    return \sprintf('<tr><td>%1$s</td><td>No preview link available</td></tr>', $tr[0]);
                }

                $url = \parse_url($tr[1]);

                if (\strpos($url['path'], ':')) { // https://domain:333/adsad:article
                    return \sprintf('<tr><td>%1$s</td><td>A dynamic page has no preview.</td></tr>', $tr[0]);
                }

                return \sprintf('<tr><td>%1$s</td><td><a href="%2$s" target="_blank">%2$s</a></td></tr>', $tr[0], $tr[1]);
            }, $rows)).
            '</tbody>'.
            '</table>'.
            '<div class="description">If no preview information appears here, '.
                'please make sure you have a <a href="/admin/structure/ekino_rendr/channel" target="_blank"><strong>channel</strong></a> and'.
                ' a <a href="/admin/content/ekino_rendr_page" target="_blank"><strong>page</strong></a> translated into the correct language.'.
                ' Once created, you also need to <a href="/admin/config/development/performance" target="_blank">clear the cache</a>.'.
            '</div>'
            ;
    }
}
