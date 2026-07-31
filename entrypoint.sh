#!/bin/sh
# Injeta a URL da API no config.js antes de iniciar o nginx
sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/assets/config.js
exec nginx -g "daemon off;"
