# SSL Sertifikaları

Bu dizine SSL sertifikalarınızı yerleştirin:

## Gerekli Dosyalar

- `fullchain.pem` - SSL sertifikası (public key)
- `privkey.pem` - Private key

## Let's Encrypt ile Sertifika Oluşturma

```bash
# Certbot kurulumu (Ubuntu/Debian)
sudo apt install certbot

# Sertifika oluşturma
sudo certbot certonly --standalone -d pubapp.redvizor.app

# Sertifikaları kopyalama
sudo cp /etc/letsencrypt/live/pubapp.redvizor.app/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/pubapp.redvizor.app/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem
```

## Test için Self-Signed Sertifika

```bash
# Test için self-signed sertifika oluşturma
openssl req -x509 -newkey rsa:4096 -keyout ssl/privkey.pem -out ssl/fullchain.pem -days 365 -nodes -subj "/CN=pubapp.redvizor.app"
```

## Docker Compose

Sertifikalar mevcut olduktan sonra:

```bash
docker compose --profile production up -d
```
