<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Tool;

class ArrayHelper
{
    public static function alterNestedKey($key, $callback, &$form)
    {
        if (!\is_array($form)) {
            return false;
        }

        if (\array_key_exists($key, $form)) {
            $callback($form[$key]);

            return true;
        }

        $applied = false;

        foreach ($form as $k => &$value) {
            $applied = self::alterNestedKey($key, $callback, $value);

            if ($applied) {
                break;
            }
        }

        return $applied;
    }
}
