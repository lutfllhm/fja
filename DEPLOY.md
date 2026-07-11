# Deploy ke VPS Hostinger dengan Docker

Setup: frontend & backend di-deploy via Docker Compose di satu VPS, diekspos ke publik lewat Nginx (reverse proxy) + SSL gratis dari Let's Encrypt.

- Frontend → `https://fja.iwareid.com`
- Backend API → `https://api.fja.iwareid.com`

## 0. Prasyarat

- VPS Hostinger aktif (Ubuntu 22.04/24.04 direkomendasikan), kamu punya akses root/SSH.
- Domain `iwareid.com` sudah ada dan bisa diatur DNS-nya (lewat hPanel Hostinger atau provider domain kamu).
- Kode sudah di GitHub (`https://github.com/lutfllhm/fja.git`).

## 1. Arahkan subdomain ke IP VPS

Di pengelola DNS domain (hPanel Hostinger → Domains → DNS Zone, atau provider domain lain):

| Type | Name | Value           |
|------|------|-----------------|
| A    | fja  | `<IP_VPS_KAMU>` |
| A    | api.fja | `<IP_VPS_KAMU>` |

Tunggu propagasi DNS (biasanya beberapa menit sampai 1 jam). Cek dengan:

```bash
ping fja.iwareid.com
```

## 2. Login ke VPS & install Docker

```bash
ssh root@<IP_VPS_KAMU>

apt update && apt upgrade -y

# Install Docker Engine + Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

docker --version
docker compose version
```

## 3. Clone project

```bash
mkdir -p /opt/apps && cd /opt/apps
git clone https://github.com/lutfllhm/fja.git
cd fja
```

## 4. Siapkan environment variables

```bash
cp .env.example .env
nano .env
```

Isi dengan nilai produksi (jangan pakai nilai default):

```env
DB_NAME=foa
DB_PASSWORD=<password-mysql-yang-kuat>

JWT_SECRET=<random-string-panjang-dan-acak>
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://fja.iwareid.com
NEXT_PUBLIC_API_URL=https://api.fja.iwareid.com
```

> VPS ini sudah menjalankan banyak container lain (lihat `docker ps`), jadi compose project ini diberi nama `fja` (lihat `name: fja` di [docker-compose.yml](docker-compose.yml)) dan dipetakan ke port host yang belum dipakai di VPS:
> - frontend → `127.0.0.1:3020` (bukan 3000, sudah dipakai container lain)
> - backend → `127.0.0.1:5020` (bukan 4000)
> - mysql → `127.0.0.1:3320` (bukan 3306, sudah dipakai beberapa container lain)
>
> Cek dulu dengan `docker ps` sebelum deploy — kalau port 3020/5020/3320 ternyata juga sudah kepakai, ganti nilai port host (sisi kiri `host:container` di `ports:`) di `docker-compose.yml` ke port lain yang kosong.

MAX_FILE_SIZE=5242880
ADMIN_DEFAULT_PASSWORD=<ganti-password-admin-default>
```

Generate `JWT_SECRET` acak:

```bash
openssl rand -base64 48
```

> Catatan: `NEXT_PUBLIC_API_URL` dipakai saat **build time** Next.js, jadi kalau nilainya berubah nanti, frontend harus di-`docker compose build` ulang (bukan cuma restart).

## 5. Build & jalankan container

```bash
docker compose up -d --build
```

Cek status & log:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Saat pertama kali jalan, container `db` otomatis import `backend/schema.sql` (membuat tabel `applications`, `admins`, dan admin default).

Test lokal di VPS (sebelum pasang Nginx):

```bash
curl http://localhost:5020/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
curl -I http://localhost:3020
```

## 6. Install Nginx & Certbot di VPS (di luar Docker)

```bash
apt install -y nginx certbot python3-certbot-nginx
```

Buat config Nginx untuk frontend:

```bash
nano /etc/nginx/sites-available/fja.iwareid.com
```

```nginx
server {
    listen 80;
    server_name fja.iwareid.com;

    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Buat config Nginx untuk backend (subdomain `api.fja`):

```bash
nano /etc/nginx/sites-available/api.fja.iwareid.com
```

```nginx
server {
    listen 80;
    server_name fja-api.iwareid.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:5020;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan kedua site:

```bash
ln -s /etc/nginx/sites-available/fja.iwareid.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.fja.iwareid.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 7. Pasang SSL gratis (Let's Encrypt)

```bash
certbot --nginx -d fja.iwareid.com -d api.fja.iwareid.com
```

Certbot otomatis mengubah config Nginx untuk redirect HTTP → HTTPS dan mengatur renewal otomatis (cek dengan `certbot renew --dry-run`).

## 8. Buka firewall (jika aktif)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

Port 3020/5020/3320 **tidak perlu** dibuka ke publik — di [docker-compose.yml](docker-compose.yml) port-port itu sudah dibind ke `127.0.0.1` saja, jadi hanya bisa diakses dari Nginx di VPS yang sama, bukan langsung dari luar.

## 9. Verifikasi akhir

- `https://fja.iwareid.com` → halaman form harus tampil.
- `https://api.fja.iwareid.com/api/auth/login` → harus merespons JSON (bukan error koneksi).
- Login admin di `https://fja.iwareid.com/admin/login`, lalu segera ganti password default lewat dashboard.

## Update / re-deploy setelah ada perubahan kode

```bash
cd /opt/apps/fja
git pull
docker compose up -d --build
```

## Maintenance umum

```bash
# Lihat log realtime
docker compose logs -f

# Restart satu service
docker compose restart backend

# Backup database
docker compose exec db mysqldump -uroot -p"$DB_PASSWORD" foa > backup_$(date +%F).sql

# Masuk shell container
docker compose exec backend sh
```
