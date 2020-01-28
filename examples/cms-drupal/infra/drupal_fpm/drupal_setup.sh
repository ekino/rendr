#!/bin/sh
chmod 777 sites/default # prevent issue with composer install not able to modify sites/default/default.services.yml
composer install --optimize-autoloader --no-dev --no-interaction

./vendor/bin/drush site:install standard -y --db-url=pgsql://postgres:example@127.0.0.1:5432/postgres --account-name=admin --account-pass=admin --site-name='Drupal Rendr Demo'
./vendor/bin/drush cache-rebuild
./vendor/bin/drush en serialization data_fixtures paragraphs rendr_demo
./vendor/bin/drush cim --partial --source=./modules/custom/rendr_demo/default_config/sync
./vendor/bin/drush fixtures:load all
