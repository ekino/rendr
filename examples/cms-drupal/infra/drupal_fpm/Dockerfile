FROM php:7.3-fpm-alpine
LABEL author="Sylvain Rascar <sylvain.rascar@ekino.com>" version="1.0"

# install the PHP extensions we need
# postgresql-dev is needed for https://bugs.alpinelinux.org/issues/3642
RUN set -eux; \
    \
    apk add --no-cache --virtual .build-deps \
    coreutils \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    postgresql-dev \
    ; \
    \
    docker-php-ext-configure gd \
    --with-freetype-dir=/usr/include \
    --with-jpeg-dir=/usr/include \
    --with-png-dir=/usr/include \
    ; \
    \
    docker-php-ext-install -j "$(nproc)" \
    gd \
    opcache \
    pdo_mysql \
    pdo_pgsql \
    zip \
    ; \
    \
    runDeps="$( \
    scanelf --needed --nobanner --format '%n#p' --recursive /usr/local \
    | tr ',' '\n' \
    | sort -u \
    | awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
    )"; \
    apk add --virtual .drupal-phpexts-rundeps $runDeps; \
    apk del .build-deps

RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=60'; \
    echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

ENV TERM xterm
# https://www.drupal.org/node/3060/release
ENV DRUPAL_VERSION 8.8.1

WORKDIR /var/www/html
COPY ./drupal_fpm/drupal_setup.sh /var/www
RUN chmod +x /var/www/drupal_setup.sh

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php -r "if (hash_file('sha384', 'composer-setup.php') === 'c5b9b6d368201a9db6f74e2611495f369991b72d9c8cbd3ffbc63edff210eb73d46ffbfce88669ad33695ef77dc76976') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"  && \
    php composer-setup.php  && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

RUN printf "\033[0;36mPlease run the following command after the first build:\ndocker-compose exec drupal_fpm /bin/sh -c \"cp /var/www/drupal_setup.sh /var/www/html && ./drupal_setup.sh\"\033[0m\n"

