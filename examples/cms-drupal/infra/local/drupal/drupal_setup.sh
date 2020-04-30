#!/bin/sh
cd /var/www/html
chmod 777 sites/default # prevent issue with composer install not able to modify sites/default/default.services.yml
echo "> Load composer install!"
composer install --optimize-autoloader --no-dev --no-interaction

echo "> Setup drupal instance"
./vendor/bin/drush site:install standard -y --db-url=pgsql://postgres:example@postgres:5432/postgres --account-name=admin --account-pass=admin --site-name='Drupal Rendr Demo'
./vendor/bin/drush cache-rebuild
./vendor/bin/drush -y en language content_translation serialization data_fixtures paragraphs rendr_demo
./vendor/bin/drush -y cim --partial --source=./modules/custom/rendr_demo/default_config/sync
./vendor/bin/drush -y fixtures:load all

echo "Drupal Setup is completed!"
