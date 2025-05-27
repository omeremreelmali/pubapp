# PubApp - Mobil Uygulama Dağıtım Platformu

PubApp, kendi sunucunuzda barındırabileceğiniz, mobil uygulama dağıtımı ve yönetimi için geliştirilmiş, App Center Distribution'a alternatif olan Next.js Full Stack platformudur.

## 🚀 Özellikler

- **Authentication & Authorization**: NextAuth.js ile güvenli giriş/kayıt sistemi
- **Organizasyon Yönetimi**: Çoklu organizasyon desteği ve davet sistemi
- **Rol Tabanlı Erişim**: Admin, Editor, Tester rolleri ile RBAC
- **Mobil Uygulama Yönetimi**: Android APK/AAB ve iOS IPA dosyalarını yönetme
- **Semantic Versioning**: Uygulama versiyonlarını semantic versioning ile yönetme
- **Dosya Depolama**: MinIO ile self-hosted S3 uyumlu depolama
- **Grup Yönetimi**: Test kullanıcılarını gruplara ayırma
- **Pre-signed URL**: Güvenli dosya indirme linkleri
- **Modern UI**: Tailwind CSS + shadcn/ui ile responsive tasarım

## ✅ Tamamlanan Özellikler

### 🔐 Authentication & Authorization

- [x] NextAuth.js ile kullanıcı girişi
- [x] Rol tabanlı yetkilendirme (Admin, Editor, Tester)
- [x] JWT tabanlı session yönetimi
- [x] Şifre hashing (bcrypt)

### 🏢 Organizasyon Yönetimi

- [x] Çoklu organizasyon desteği
- [x] Organizasyon oluşturma
- [x] Kullanıcı davet sistemi
- [x] Rol tabanlı erişim kontrolü

### 👥 Kullanıcı Yönetimi

- [x] Kullanıcı listesi ve istatistikleri
- [x] Davet gönderme ve yönetimi
- [x] Rol badge'leri ve görsel arayüz

### 📱 Uygulama Yönetimi

- [x] Uygulama oluşturma (Android/iOS)
- [x] Uygulama listesi ve filtreleme
- [x] Platform bazlı kategorileme
- [x] Uygulama detay sayfası
- [x] Paket adı validasyonu
- [x] Slug tabanlı URL yapısı

### 📦 Dosya Yükleme & Depolama

- [x] MinIO entegrasyonu
- [x] Dosya yükleme arayüzü (drag & drop)
- [x] Dosya validasyonu (APK/AAB/IPA)
- [x] Progress bar ile yükleme takibi
- [x] Semantic versioning desteği
- [x] Build numarası yönetimi

### 🔗 İndirme Sistemi

- [x] Pre-signed URL'ler
- [x] Güvenli indirme linkleri
- [x] İndirme sayacı
- [x] Link süresi yönetimi
- [x] Tek kullanımlık tokenlar

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Storage**: MinIO (S3 Compatible)
- **Validation**: Yup
- **UI Components**: Radix UI, Lucide Icons
- **Containerization**: Docker & Docker Compose

## 🔄 Gelecek Özellikler

### 🔢 Versiyon Detayları

- [ ] Versiyon detay sayfası
- [ ] Release notes görüntüleme
- [ ] Versiyon karşılaştırma
- [ ] Versiyon silme

### 👥 Grup Yönetimi

- [ ] Test kullanıcı grupları
- [ ] Grup bazlı erişim kontrolü
- [ ] Grup davet sistemi

### 📊 İstatistikler & Raporlama

- [ ] İndirme istatistikleri
- [ ] Kullanım raporları
- [ ] Dashboard grafikleri

### 🔗 API & CLI

- [ ] REST API dokümantasyonu
- [ ] CLI tool
- [ ] Webhook desteği

## 📋 Gereksinimler

- Node.js 18+
- Docker & Docker Compose
- Git

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd pubapp
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Dosyasını Oluşturun

```bash
cp .env.example .env
```

### 4. Docker Servislerini Başlatın

```bash
docker-compose up -d
```

### 5. Veritabanını Migrate Edin

```bash
npx prisma migrate dev
```

### 6. Prisma Client'ı Oluşturun

```bash
npx prisma generate
```

### 7. Uygulamayı Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📊 Veritabanı Yönetimi

### Migration Oluşturma

```bash
npx prisma migrate dev --name migration_name
```

### Prisma Studio

```bash
npx prisma studio
```

### Veritabanını Sıfırlama

```bash
npx prisma migrate reset
```

## 🔧 Geliştirme

### Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── validations/      # Yup schemas
├── types/                # TypeScript type definitions
└── generated/            # Generated files (Prisma)
```

### API Endpoints

- `POST /api/auth/register` - Kullanıcı kaydı
- `GET/POST /api/organizations` - Organizasyon yönetimi
- `GET/POST /api/organizations/invite` - Kullanıcı davet etme
- `GET/POST /api/apps` - Uygulama yönetimi
- `GET/POST /api/apps/[slug]/versions` - Versiyon yönetimi
- `POST /api/apps/[slug]/versions/[id]/download` - İndirme linki oluşturma
- `GET /api/download/[token]` - Dosya indirme

## 🧪 Test

### İlk Kullanıcı Oluşturma

1. http://localhost:3000/auth/signup adresine gidin
2. İlk kullanıcı otomatik olarak ADMIN rolü alacaktır
3. Organizasyon oluşturun
4. Diğer kullanıcıları davet edin

### Test Senaryoları

1. **Admin Kullanıcı**: Organizasyon oluşturma, kullanıcı davet etme, uygulama yönetimi
2. **Editor Kullanıcı**: Uygulama ekleme, versiyon yükleme, dosya yönetimi
3. **Tester Kullanıcı**: Sadece yetkili uygulamaları görme ve indirme

## 🐳 Docker

### Sadece Veritabanı ve MinIO

```bash
docker-compose up postgres minio -d
```

### Tüm Servisleri Durdurma

```bash
docker-compose down
```

### Volume'ları Temizleme

```bash
docker-compose down -v
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Herhangi bir sorun yaşarsanız, lütfen GitHub Issues'da bir konu açın.
