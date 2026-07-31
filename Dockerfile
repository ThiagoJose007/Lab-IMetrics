FROM nginx:alpine

# O nginx:alpine processa arquivos em /etc/nginx/templates/ automaticamente
# substituindo variáveis de ambiente antes de iniciar
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
