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
            '<tr>'.
            \implode('', \array_map(function ($tr) {
                return \sprintf('<td>%1$s</td><td><a href="%2$s" target="_blank">%2$s</a></td>', $tr[0], $tr[1]);
            }, $rows)).
            '</tr>'.
            '</tbody>'.
            '</table>';
    }
}
