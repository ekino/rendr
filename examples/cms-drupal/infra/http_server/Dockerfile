FROM nginx:1.17-alpine
LABEL author="Sylvain Rascar <sylvain.rascar@ekino.com>" version="1.0"

ENV TERM xterm

EXPOSE 8888

COPY ./http_server/www.drupal-cms.localdev.conf /etc/nginx/conf.d/www.drupal-cms.localdev.conf

RUN rm /etc/nginx/conf.d/default.conf
