#!/bin/sh
sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/assets/config.js
PORT=${PORT:-80}
sed -i "s|listen 80;|listen ${PORT};|g" /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
