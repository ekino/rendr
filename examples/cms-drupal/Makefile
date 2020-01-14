.DEFAULT_GOAL=start

build:
	docker-compose up -d --build
	docker-compose exec drupal_fpm /bin/sh -c "cp /var/www/drupal_setup.sh /var/www/html && ./drupal_setup.sh"

destroy:
	docker-compose rm

reset:
	make stop destroy build
	
start:
	docker-compose up

stop:
	docker-compose stop

