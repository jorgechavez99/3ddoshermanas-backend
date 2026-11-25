# Despliegue de la API en el VPS de IONOS

Se despliega en el mismo VPS que la web. Requisitos ya instalados por la guía de la web: Node 22, PM2, Nginx, Certbot.

## 1. MySQL

```bash
sudo apt-get install -y mysql-server      # o mariadb-server
sudo mysql -e "CREATE DATABASE tienda3d CHARACTER SET utf8mb4;
  CREATE USER 'app3d'@'localhost' IDENTIFIED BY '<contraseña-larga>';
  GRANT SELECT, INSERT, UPDATE ON tienda3d.* TO 'app3d'@'localhost';"
```

El usuario de la app no tiene permiso para borrar tablas: si alguien consiguiera la clave, el daño queda limitado.

## 2. Código

```bash
cd /var/www
git clone https://github.com/jorgechavez99/3ddoshermanas-backend.git
cd 3ddoshermanas-backend
npm ci --omit=dev
cp .env_template .env && nano .env      # datos de MySQL y CLAVE_ADMIN
sudo mysql tienda3d < models/queries.sql
npm run semilla                         # opcional
pm2 start deploy/ecosystem.config.js && pm2 save
curl http://127.0.0.1:4010/api/v1/salud
```

## 3. Subdominio api.3ddoshermanas.com

1. DNS en IONOS: registro `A` de `api` a la IP del VPS.
2. Nginx (`/etc/nginx/sites-available/api-3ddoshermanas`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.3ddoshermanas.com;

    location / {
        proxy_pass http://127.0.0.1:4010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/api-3ddoshermanas /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.3ddoshermanas.com
```

## 4. Fotos de productos

Subirlas a `/var/www/3ddoshermanas-fotos/` (por SFTP) y servirlas añadiendo al bloque de la web:

```nginx
location /fotos/ {
    alias /var/www/3ddoshermanas-fotos/;
    add_header Cache-Control "public, max-age=2592000";
}
```

La `foto_url` del producto queda como `https://3ddoshermanas.com/fotos/llavero-pikachu.jpg`.

## 5. Conectar la web

En el `.env` del frontend: `NEXT_PUBLIC_API_URL=https://api.3ddoshermanas.com` y volver a compilar. La web refresca el catálogo sola cada hora.

## Actualizar

```bash
cd /var/www/3ddoshermanas-backend && git pull origin main && npm ci --omit=dev && pm2 reload 3ddoshermanas-api
```
