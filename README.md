# PubApp - Mobil Uygulama Dağıtım Platformu

PubApp, kendi sunucunuzda barındırabileceğiniz, mobil uygulama dağıtımı ve yönetimi için geliştirilmiş, App Center Distribution'a alternatif olan Next.js Full Stack platformudur.

## 🚀 Özellikler

- **Authentication & Authorization**: NextAuth.js ile güvenli giriş/kayıt sistemi
- **Çoklu Dil Desteği**: İngilizce/Türkçe i18n desteği (react-i18next)
- **Organizasyon Yönetimi**: Çoklu organizasyon desteği ve davet sistemi
- **Rol Tabanlı Erişim**: Admin, Editor, Tester rolleri ile RBAC
- **Mobil Uygulama Yönetimi**: Android APK/AAB ve iOS IPA dosyalarını yönetme
- **Semantic Versioning**: Uygulama versiyonlarını semantic versioning ile yönetme
- **Dosya Depolama**: MinIO ile self-hosted S3 uyumlu depolama
- **Grup Yönetimi**: Test kullanıcılarını gruplara ayırma
- **Tag Sistemi**: Versiyonları renkli etiketlerle kategorilendirme
- **Pre-signed URL**: Güvenli dosya indirme linkleri
- **iOS Özel Özellikleri**: IPA analizi, Configuration Profile desteği
- **Modern UI**: Tailwind CSS + shadcn/ui ile responsive tasarım

## ✅ Tamamlanan Özellikler

### 🌐 Çoklu Dil Desteği (i18n)

- [x] React-i18next entegrasyonu
- [x] İngilizce/Türkçe dil desteği
- [x] Gerçek zamanlı dil değiştirme
- [x] localStorage ile dil tercihi kaydetme
- [x] Tüm sayfalarda LanguageSwitcher komponenti
- [x] Interpolation desteği ({{variable}})

### 🔐 Authentication & Authorization

- [x] NextAuth.js ile kullanıcı girişi
- [x] Rol tabanlı yetkilendirme (Admin, Editor, Tester)
- [x] JWT tabanlı session yönetimi
- [x] Şifre hashing (bcrypt)
- [x] Email/Password authentication

### 🏢 Organizasyon Yönetimi

- [x] Çoklu organizasyon desteği
- [x] Organizasyon oluşturma ve seçimi
- [x] Kullanıcı davet sistemi (email + role)
- [x] Davet kodları ve süre yönetimi
- [x] Rol tabanlı erişim kontrolü

### 👥 Kullanıcı Yönetimi

- [x] Kullanıcı listesi ve istatistikleri
- [x] Rol badge'leri (Admin/Editor/Tester)
- [x] Davet gönderme ve yönetimi
- [x] Bekleyen davetleri görüntüleme
- [x] Rol güncelleme sistemi

### 📱 Uygulama Yönetimi

- [x] Uygulama oluşturma (Android/iOS)
- [x] Uygulama listesi ve filtreleme
- [x] Platform bazlı kategorileme
- [x] Uygulama detay sayfası
- [x] Paket adı validasyonu
- [x] Slug tabanlı URL yapısı
- [x] Platform badge'leri

### 📦 Dosya Yükleme & Depolama

- [x] MinIO entegrasyonu
- [x] Dosya yükleme arayüzü (drag & drop)
- [x] Dosya validasyonu (APK/AAB/IPA)
- [x] Progress bar ile yükleme takibi
- [x] Semantic versioning desteği
- [x] Build numarası yönetimi
- [x] Dosya boyutu formatlaması

### 🔗 İndirme Sistemi

- [x] Pre-signed URL'ler
- [x] Güvenli indirme linkleri
- [x] İndirme sayacı
- [x] Link süresi yönetimi
- [x] Tek kullanımlık tokenlar
- [x] İndirme istatistikleri

### 🏷️ Tag Sistemi

- [x] Renkli tag oluşturma
- [x] Tag CRUD işlemleri
- [x] Versiyonlara tag atama
- [x] Tag filtreleme sistemi
- [x] Kullanım sayısı takibi

### 👥 Grup Yönetimi

- [x] Test kullanıcı grupları oluşturma
- [x] Grup üyeleri yönetimi
- [x] Uygulama erişim izinleri
- [x] Grup detay sayfaları
- [x] Üye ekleme/çıkarma
- [x] Grup istatistikleri

### 📊 İstatistikler & Dashboard

- [x] Dashboard ana sayfa
- [x] Kullanıcı/Uygulama/İndirme istatistikleri
- [x] Son aktiviteler listesi
- [x] Organizasyon bilgileri
- [x] İndirme raporları
- [x] Top indirilen uygulamalar

### 🍎 iOS Özel Özellikleri

- [x] IPA dosya analizi
- [x] Configuration Profile indirme
- [x] iOS Distribution Type tespiti
- [x] Team ID ve Bundle ID çıkarma
- [x] Provisioning Profile desteği

### 📝 Versiyon Yönetimi

- [x] Versiyon detay sayfaları
- [x] Versiyon düzenleme
- [x] Release notes
- [x] Tag ataması
- [x] Versiyon silme
- [x] Build numarası kontrolü

## 🛠️ Teknoloji Stack

### Frontend

- **Next.js 15.3.2** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library based on Radix UI
- **Lucide React** - Icon library
- **react-i18next** - Internationalization
- **React Hook Form** - Form management
- **Yup & Zod** - Schema validation

### Backend

- **Next.js API Routes** - Server-side API
- **NextAuth.js 4.24.11** - Authentication
- **Prisma 6.8.2** - Database ORM
- **PostgreSQL** - Primary database
- **MinIO** - S3-compatible object storage
- **bcryptjs** - Password hashing

### Additional Libraries

- **@auth/prisma-adapter** - NextAuth Prisma integration
- **node-stream-zip** - ZIP file handling
- **plist** - iOS plist parsing
- **react-dropzone** - File upload
- **sonner** - Toast notifications

### Development Tools

- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma Studio** - Database GUI
- **Docker Compose** - Container orchestration

## 🗂️ Proje Yapısı

```
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Seed data
├── public/                   # Static files
├── scripts/                  # Utility scripts
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API Routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── organizations/ # Organization management
│   │   │   ├── apps/        # App management
│   │   │   ├── users/       # User management
│   │   │   ├── groups/      # Group management
│   │   │   ├── tags/        # Tag management
│   │   │   └── download/    # Download endpoints
│   │   ├── auth/            # Authentication pages
│   │   │   ├── signin/      # Sign in page
│   │   │   ├── signup/      # Sign up page
│   │   │   └── signout/     # Sign out page
│   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── page.tsx     # Main dashboard
│   │   │   ├── apps/        # App management
│   │   │   │   ├── page.tsx # Apps list
│   │   │   │   ├── new/     # Create new app
│   │   │   │   └── [slug]/  # App details
│   │   │   │       ├── page.tsx          # App detail
│   │   │   │       └── versions/         # Version management
│   │   │   │           ├── new/          # Upload new version
│   │   │   │           └── [versionId]/
│   │   │   │               └── edit/     # Edit version
│   │   │   ├── users/       # User management
│   │   │   ├── groups/      # Group management
│   │   │   ├── tags/        # Tag management
│   │   │   ├── organizations/ # Organization pages
│   │   │   ├── tester/      # Tester interface
│   │   │   ├── downloads/   # Download statistics
│   │   │   └── setup/       # Initial setup
│   │   ├── invite/          # Invitation acceptance
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── providers.tsx    # Context providers
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── forms/          # Form components
│   │   └── language-switcher.tsx # Language switcher
│   ├── i18n/               # Internationalization
│   │   ├── locales/
│   │   │   ├── en/common.json # English translations
│   │   │   └── tr/common.json # Turkish translations
│   │   └── i18n.ts         # i18n configuration
│   ├── lib/                # Utility libraries
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client
│   │   ├── minio.ts        # MinIO client
│   │   ├── utils.ts        # General utilities
│   │   ├── file-utils.ts   # File handling utilities
│   │   └── validations/    # Schema validations
│   ├── types/              # TypeScript definitions
│   └── generated/          # Generated files
│       └── prisma/         # Prisma client
├── docker-compose.yml      # Docker services
├── package.json           # Dependencies
└── README.md             # This file
```

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/signin` - Kullanıcı girişi

### Organizations

- `GET/POST /api/organizations` - Organizasyon yönetimi
- `POST /api/organizations/invite` - Kullanıcı davet etme
- `PUT /api/organizations/[id]` - Organizasyon güncelleme

### Apps

- `GET/POST /api/apps` - Uygulama yönetimi
- `GET /api/apps/[slug]` - Uygulama detayları
- `PUT /api/apps/[slug]` - Uygulama güncelleme

### Versions

- `GET/POST /api/apps/[slug]/versions` - Versiyon yönetimi
- `PUT /api/apps/[slug]/versions/[id]` - Versiyon güncelleme
- `DELETE /api/apps/[slug]/versions/[id]` - Versiyon silme
- `POST /api/apps/[slug]/versions/[id]/analyze` - iOS IPA analizi

### Downloads

- `POST /api/apps/[slug]/versions/[id]/download` - İndirme linki oluşturma
- `GET /api/download/[token]` - Dosya indirme

### Users & Groups

- `GET /api/users` - Kullanıcı listesi
- `GET/POST /api/groups` - Grup yönetimi
- `POST /api/groups/[id]/members` - Grup üyesi ekleme

### Tags

- `GET/POST /api/tags` - Tag yönetimi
- `PUT/DELETE /api/tags/[id]` - Tag güncelleme/silme

## 📊 Veritabanı Şeması

### Ana Modeller

- **User** - Kullanıcı bilgileri ve authentication
- **Organization** - Organizasyon yönetimi
- **OrganizationMember** - Kullanıcı-organizasyon ilişkisi
- **App** - Mobil uygulama bilgileri
- **AppVersion** - Uygulama versiyonları
- **Group** - Test kullanıcı grupları
- **Tag** - Versiyon etiketleri
- **DownloadLink** - Pre-signed download URLs

### İlişkiler

- Çoklu organizasyon desteği (Many-to-Many)
- Rol tabanlı erişim kontrolü
- Grup-uygulama erişim izinleri
- Tag-versiyon ilişkileri
- Güvenli dosya indirme sistemi

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

**Gerekli environment variables:**

```env
DATABASE_URL="postgresql://pubapp:pubapp123@localhost:5432/pubapp"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="pubapp-files"
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

### 7. Seed Data Yükleyin (Opsiyonel)

```bash
npx prisma db seed
```

### 8. Uygulamayı Başlatın

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

### Schema Değişikliklerini Push Etme

```bash
npx prisma db push
```

## 🔧 Geliştirme

### Yeni Dil Ekleme

1. `src/i18n/locales/` altında yeni klasör oluşturun
2. `common.json` dosyasını çevirin
3. `src/components/language-switcher.tsx` dosyasına yeni dili ekleyin
4. `src/i18n/i18n.ts` dosyasında resource'a ekleyin

### Yeni Sayfa Ekleme

1. `src/app/dashboard/` altında yeni sayfa oluşturun
2. Çeviri anahtarlarını `locales/*/common.json` dosyalarına ekleyin
3. `LanguageSwitcher` komponentini ekleyin
4. `useTranslation` hook'unu kullanın

### API Endpoint Ekleme

1. `src/app/api/` altında yeni route oluşturun
2. Prisma modellerini kullanın
3. NextAuth session kontrolü ekleyin
4. Yup/Zod ile validation yapın

## 🧪 Test

### İlk Kullanıcı Oluşturma

1. http://localhost:3000/auth/signup adresine gidin
2. İlk kullanıcı otomatik olarak ADMIN rolü alacaktır
3. Organizasyon oluşturun
4. Diğer kullanıcıları davet edin

### Test Senaryoları

1. **Admin Kullanıcı**:

   - Organizasyon oluşturma
   - Kullanıcı davet etme
   - Uygulama yönetimi
   - Tag oluşturma
   - Grup yönetimi

2. **Editor Kullanıcı**:

   - Uygulama ekleme
   - Versiyon yükleme
   - Dosya yönetimi
   - Tag atama

3. **Tester Kullanıcı**:
   - Sadece yetkili uygulamaları görme
   - Dosya indirme
   - Versiyon detaylarını görme

### Platform Testleri

- **Android**: APK/AAB dosyaları yükleme
- **iOS**: IPA dosyaları yükleme ve analiz
- **Cross-platform**: Tag sistemi, grup erişimleri

## 🌐 Dil Desteği

- **İngilizce (en)**: Ana dil
- **Türkçe (tr)**: Tam destek
- Gerçek zamanlı dil değiştirme
- localStorage ile tercih kaydetme
- Interpolation desteği

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

## 🔄 Gelecek Özellikler

### 📱 Mobil Uygulama

- [ ] React Native mobil uygulama
- [ ] Push notification desteği
- [ ] Offline indirme özelliği

### 🔗 API & CLI

- [ ] REST API dokümantasyonu
- [ ] CLI tool geliştirme
- [ ] Webhook desteği
- [ ] Batch upload özelliği

### 📊 Gelişmiş Analytics

- [ ] Detaylı kullanım analytics
- [ ] A/B testing desteği
- [ ] User behavior tracking
- [ ] Custom dashboard widgets

### 🔒 Güvenlik Geliştirmeleri

- [ ] 2FA authentication
- [ ] IP whitelist
- [ ] Rate limiting
- [ ] Audit logging

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

---

**PubApp** - Kendi sunucunuzda mobil uygulama dağıtımı! 🚀
