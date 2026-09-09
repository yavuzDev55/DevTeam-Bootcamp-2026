# Ödev 3 — Veritabanı, ilişkiler ve migration

> İTÜ ACM DevTeam Bootcamp 2026 · Ders 3: Veritabanı, ORM ve migration
>
> 🔗 [Ödevin tarayıcıda okunabilir hâli (ilerleme takipli)](https://claude.ai/code/artifact/89019764-3bb5-42d7-aa45-8a6219828d35)
> · 🐘 [Ders 3 materyali](https://claude.ai/code/artifact/a4b1b7e3-538d-41fd-91e4-9829ef771546)

Hafta 2'de bellekteki bir dizi üzerine çalışan bir REST API yazdınız. Bu ödevde
o diziyi **PostgreSQL** ile değiştirecek, üstüne iki yeni ilişki kuracaksınız.

Hedef basit ama iddialı: **API sözleşmeniz değişmeyecek.** Hafta 2'nin 27
testinin tek satırına dokunmadan hepsi geçmeye devam etmeli — üstüne bu haftanın
22 testi eklenecek.

**Toplam 49 test.** Başlangıç noktanız kendi ödev 2 çözümünüz.

---

## Ne ekleniyor

| Metod | Yol | Ne yapar |
|---|---|---|
| `PUT` | `/users/:id/profile` | Profili oluşturur ya da günceller (bire-bir) |
| `GET` | `/users/:id/profile` | Profili döner |
| `POST` | `/tags` | Etiket oluşturur |
| `GET` | `/tags` | Etiketleri listeler |
| `POST` | `/todos/:id/tags` | Todo'ya etiket bağlar (çoka-çok) |
| `GET` | `/todos/:id/tags` | Todo'nun etiketlerini döner |
| `DELETE` | `/todos/:id/tags/:tagId` | Bağlantıyı kaldırır |

Mevcut `todos` kaynağına bir de `priority` alanı ekleniyor.

---

# Bölüm 1 · Başlamadan

## 1.1 Güncellemeleri çekin

Ödev 2'deki akışın aynısı:

```bash
git fetch upstream
git merge upstream/master
npm install
```

Bu, `tests/` klasörünü, `prisma.config.js`'i, `db/prisma.js`'i ve
`package.json`'daki yeni bağımlılıkları getirir. Kendi yazdığınız
`modules/`, `utils/` ve `app.js` dosyalarına dokunmaz — çakışma yaşamamanız
için dosya sahipliğini böyle ayırdık.

`npm install` yeni bağımlılıkları kurar: `prisma` (komut satırı aracı),
`@prisma/client` (uygulamanın kullandığı kütüphane), `@prisma/adapter-pg`
(Prisma'yı `pg` sürücüsüne bağlar) ve `pg`.

> **`npm i prisma@latest` yazmayın.** `latest` şu anda bir release
> candidate'a çözülüyor. Sürümler `package.json`'da zaten sabitli;
> `npm install` demeniz yeterli.

## 1.2 Neon'da iki veritabanı

Testler veritabanına gerçekten yazıp siliyor. Geliştirme verinizle aynı yerde
çalışırlarsa her `npm test` sonrası verileriniz uçar. Bu yüzden **iki ayrı
veritabanı** kullanacağız.

Neon'da bir projeden **branch** türetebiliyorsunuz — tıpkı git'teki gibi,
anında ve ayrı bir bağlantı dizesiyle:

1. Neon panelinde projenizi açın → **Branches** → **New branch**
2. Adı: `test`, kaynağı: `main`
3. Oluşan branch'in bağlantı dizesini kopyalayın

Sonra iki dosya oluşturun (ikisi de `.gitignore`'da, repoya girmezler):

```bash
# .env — geliştirme
DATABASE_URL="postgresql://...main branch bağlantısı..."
```

```bash
# .env.test — testler
DATABASE_URL="postgresql://...test branch bağlantısı..."
```

`package.json`'daki scriptler hangisini kullanacağını biliyor:

```
npm run dev   → --env-file=.env
npm test      → --env-file=.env.test
```

> **Dikkat.** `.env.test`'i yanlışlıkla geliştirme branch'ine bağlarsanız
> testler kendi verinizi siler. İki bağlantı dizesinin **farklı** olduğundan
> emin olun.

## 1.3 Neler hazır geliyor, neler sizin

| Dosya | Kim yazar |
|---|---|
| `tests/` — 8 dosya | **Biz.** Dokunmayın |
| `db/prisma.js` | **Biz.** Prisma client'ı kuran dosya |
| `prisma.config.js` | **Biz.** Prisma CLI'nin yapılandırması |
| `prisma/schema.prisma` | Blokları hazır, **modelleri siz yazacaksınız** |
| `package.json`, `index.js` | **Biz** |
| `app.js`, `modules/`, `utils/` | **Siz** |

### `prisma.config.js` neden var, kim okuyor?

Bu dosyayı kodunuz `import` etmiyor. Onu **Prisma CLI'si** okuyor — dosya adı
sözleşmesiyle, otomatik. `npx prisma migrate` çalıştırdığınızda veritabanına
bağlanması gerekir; adresi buradan alır.

Veritabanına giden **iki ayrı yol** var ve ikisi birbirinden habersiz:

```
npx prisma migrate  →  prisma.config.js  →  datasource.url
node index.js       →  db/prisma.js      →  PrismaPg adapter
```

`prisma.config.js` içindeki `process.loadEnvFile(".env")` satırı da bundan:
uygulamayı biz `node --env-file` ile başlatıyoruz, ama `npx prisma` komutunu
Prisma kendi süreci olarak başlatıyor — ona bayrak geçiremiyoruz.

### `tests/helper.js` neyi değiştirdi?

Bir satır eklendi ve bu satır tüm ödevin özeti:

```js
await prisma.$executeRawUnsafe(
  'TRUNCATE TABLE "todo_tags", "profiles", "todos", "tags", "users" RESTART IDENTITY CASCADE',
);
```

Hafta 2'de her test süreci **boş bir diziyle** başlıyordu; temizliğe gerek
yoktu. Veritabanı öyle değil — kayıtlar çalıştırmalar arasında kalıyor.
Temizlemezseniz sabit e-posta kullanan testler ikinci çalıştırmada 409 alır.

`CASCADE` gerekli, çünkü `todo_tags` ve `profiles` başka tablolara foreign key
ile bağlı; onlar dururken bağlı oldukları tabloyu boşaltamazsınız.

**Öğrenilecek şey:** veri katmanını değiştirdiğinizde test altyapısı da değişir.
Testler kodunuzun bir parçasıdır, dışında bir şey değil.

---

# Bölüm 2 · Veri modeli

Beş model yazacaksınız. `prisma/schema.prisma` içindeki `generator` ve
`datasource` blokları hazır — onlara dokunmayın, altına modelleri ekleyin.

### User

Hafta 2'deki alanlar: `id` (uuid), `username` (benzersiz), `email` (benzersiz),
`password`, `createdAt`. Üstüne iki ilişki: `todos` ve `profile`.

### Profile — bire-bir

`id`, `bio`, `userId`. Kritik nokta: `userId` **benzersiz** olmalı.

Bire-bir ilişki, bire-çoğun üstüne bir `UNIQUE` eklemekten ibarettir. O kısıt
olmadan bir kullanıcıya iki profil yazılabilir ve ilişki sessizce bire-çoğa
dönüşür.

### Todo

Hafta 2'deki alanlar + **`priority`** (tam sayı, varsayılan `0`) + `tags`
ilişkisi.

> `priority`'yi ilk migration'a **koymayın.** Bölüm 4'te ikinci bir migration
> ile ekleyeceksiniz — testlerden biri bunu kontrol ediyor.

### Tag

`id` ve `name`. `name` benzersiz.

### TodoTag — çoka-çok bağlantı tablosu

`todoId` ve `tagId`. Bu tablonun birincil anahtarı **ikisi birlikte**:

```prisma
@@id([todoId, tagId])
```

Bu, aynı etiketin aynı todo'ya iki kez yapıştırılmasını veritabanı seviyesinde
imkânsız kılar. Aynı kontrolü JavaScript'te yazsaydınız, iki isteğin aynı anda
gelmesi durumunda kaçırabilirdiniz.

### Kolon adları

Veritabanı geleneği `snake_case`, JavaScript'inki `camelCase`. Ama asıl mesele
şu: **veritabanının şeması ile API'nizin sözleşmesi ayrı iki şeydir.** Çeviriyi
Prisma yapsın:

```prisma
userId    String?  @map("user_id")
createdAt DateTime @default(now()) @map("created_at")

@@map("todos")
```

`@map` kolonu, `@@map` tabloyu eşler. Kodunuzda `userId` yazarsınız,
veritabanında `user_id` durur.

> **Dikkat.** Hafta 2'de satırları elle nesneye çeviren bir fonksiyonunuz varsa
> (`row.user_id` gibi okuyan), onu **silin.** Prisma zaten `userId` döndürüyor;
> `todo.user_id` okumak `undefined` verir ve alan sessizce kaybolur.

---

# Bölüm 3 · İlk migration

```bash
npx prisma migrate dev --name init
```

Bu komut üç şey yapar: şemanız ile veritabanının mevcut hâli arasındaki farkı
hesaplar, farkı kapatan SQL'i `prisma/migrations/<tarih>_init/migration.sql`
dosyasına yazar, ve o dosyayı çalıştırır. Ardından `prisma generate`'i de
kendisi çalıştırır.

**Üretilen dosyayı açıp okuyun.** İçinde derste öğrendiğiniz her şey var:
`NOT NULL`, `DEFAULT`, `PRIMARY KEY`, `UNIQUE INDEX`, `FOREIGN KEY … ON DELETE
CASCADE`. Prisma yeni bir şey icat etmiyor; sizin yazacağınız SQL'i sizin adınıza
üretiyor.

Aynı komutu `.env.test`'teki test branch'i için de çalıştırmanız gerekir:

```bash
node --env-file=.env.test node_modules/prisma/build/index.js migrate deploy
```

### Dikkat edilecekler

**1. Elle tablo oluşturduysanız drift uyarısı alırsınız.** Neon konsolunda
elle tablo kurduysanız, `migrate dev` veritabanında tablo görüp migration
geçmişi bulamayacak ve sıfırlamayı teklif edecek. Kabul edin — şemanın tek bir
sahibi olur, o da bundan sonra Prisma.

**2. `migrate dev` çalıştırdığınız an ham SQL dönemi biter.** Prisma'nın
ürettiği tabloda `id` kolonunun **veritabanı varsayılanı yoktur**; çünkü
`@default(uuid())` id'yi JavaScript tarafında üretir. Eğer bu noktadan sonra
elle `INSERT INTO users (username, ...)` yazarsanız şu hatayı alırsınız:

```
null value in column "id" of relation "users" violates not-null constraint
```

Çözüm: db katmanını Prisma'ya geçirin.

**3. `prisma generate`'i unutmayın.** Şemayı değiştirip migration üretmediyseniz
client eski hâlde kalır ve yeni alan `PrismaClientValidationError` verir.

---

# Bölüm 4 · Aşamalar

## Aşama 1 — mevcut API'yi veritabanına taşımak

*Testler: `00-warmup`, `01-todos`, `02-users`, `03-relations` — 24 test*

Her modüle bir **db katmanı** ekleyin: `modules/todos/todos.db.js` ve
`modules/users/users.db.js`. Veritabanıyla konuşan tek yer burası olacak.

Service'leriniz `async` olacak ama **imzaları değişmeyecek**; controller'lara
`await` girecek. Router ve validator'lara dokunmanız gerekmiyor.

### Dikkat edilecekler

**1. Prisma'nın `update` ve `delete`'i kayıt yoksa hata fırlatır.** Dizideki
`find` gibi sessizce `undefined` dönmez. 404 dönebilmek için fırlatmayan
sürümleri kullanın:

```js
// YANLIŞ — kayıt yoksa 500 döner
export const deleteTodo = async (id) => {
  return await prisma.todo.delete({ where: { id } });
};

// DOĞRU — deleteMany fırlatmaz, sadece count: 0 döner
export const deleteTodo = async (id) => {
  const { count } = await prisma.todo.deleteMany({ where: { id } });
  return count > 0;
};
```

Aynısı güncelleme için:

```js
export const updateTodo = async (id, alanlar) => {
  const { count } = await prisma.todo.updateMany({ where: { id }, data: alanlar });
  if (count === 0) return undefined;
  return selectTodoById(id);
};
```

**2. `select` ile dönecek alanları siz seçin.** Dört fonksiyonun dört farklı
şekil döndürmesi en sık yapılan hata. Seçimi tek bir sabitte toplayın:

```js
const secim = {
  id: true, title: true, description: true,
  completed: true, priority: true, userId: true, createdAt: true,
};
```

**3. Sıralama artık garanti değil.** Dizide sıra eklenme sırasıydı. Veritabanı
öyle çalışmaz — `orderBy` yazmazsanız PostgreSQL istediği sırada dönebilir.

**4. `req.body`'yi doğrudan `data`'ya vermeyin.** PATCH'te yalnızca izin
verdiğiniz alanları geçirin; aksi hâlde istemci `id`'yi bile değiştirmeye
çalışabilir.

## Aşama 2 — priority ve ikinci migration

*Testler: `05-priority` — 6 test*

Şemadaki `Todo` modeline `priority` alanını ekleyin ve **ikinci bir migration**
üretin:

```bash
npx prisma migrate dev --name add_priority
```

`POST /todos` isteğe bağlı bir `priority` kabul etsin (gönderilmezse `0`),
`PATCH /todos/:id` ile güncellenebilsin.

### Dikkat edilecekler

**1. İlk migration'ı elle düzenlemeyin.** Testlerden biri
`prisma/migrations` altında **en az iki klasör** olduğunu kontrol ediyor.
Migration'ın amacı şemanın nasıl bu hâle geldiğinin kaydını tutmaktır; geçmişi
sonradan değiştirmek o kaydı yalan yapar.

**2. Varsayılanı controller'da değil şemada verin.** `priority` gönderilmediğinde
`0` olmasını `@default(0)` sağlamalı. Controller'da `priority ?? 0` yazmak da
çalışır ama kural iki yere dağılır.

**3. `Number.isInteger` kullanın.** `typeof x === "number"` `3.5` ve `NaN` için
de doğru döner.

## Aşama 3 — profil (bire-bir)

*Testler: `06-profile` — 6 test*

- `PUT /users/:id/profile` — gövde `{ bio }`. Profil yoksa oluşturur, varsa
  günceller. **200** döner.
- `GET /users/:id/profile` — profili döner.

### Dikkat edilecekler

**1. `PUT` neden `POST` değil?** Aynı isteği iki kez göndermek aynı sonucu
vermeli — bire-bir ilişkide "ikinci profil" diye bir şey yok. Prisma'nın
`upsert`'ü tam bunun için:

```js
export const upsertProfile = (userId, bio) =>
  prisma.profile.upsert({
    where: { userId },
    update: { bio },
    create: { userId, bio },
    select: { id: true, bio: true, userId: true },
  });
```

Testlerden biri ikinci `PUT` sonrası **aynı `id`'nin** döndüğünü kontrol
ediyor — yani gerçekten güncellediğinizi, yeni satır açmadığınızı.

**2. İki ayrı 404 var.** Kullanıcı yoksa 404, kullanıcı var ama profili yoksa
yine 404. İkisini de dönün; boş nesne dönmeyin.

**3. Olmayan kullanıcıya profil yazılamamalı.** `PUT` işleminden önce kullanıcının
varlığını kontrol edin.

## Aşama 4 — etiketler (çoka-çok)

*Testler: `07-tags` — 10 test*

Yeni bir modül açın: `modules/tags/`. Hafta 2'deki dört katmanın aynısı —
`router`, `validator`, `controller`, `service` — artı `db`.

- `POST /tags` `{ name }` → 201. Aynı isim ikinci kez → 409.
- `GET /tags` → 200
- `POST /todos/:id/tags` `{ tagId }` → 201. Aynı çift ikinci kez → 409.
- `GET /todos/:id/tags` → 200, etiket dizisi
- `DELETE /todos/:id/tags/:tagId` → 204

`app.js`'e yeni router'ı bağlamayı unutmayın.

### Dikkat edilecekler

**1. Bağlantı tablosuna Prisma'dan `prisma.todoTag` ile erişilir.** Model adı
`TodoTag` ise client'taki karşılığı `todoTag`'dir.

**2. Etiketleri okurken iç içe `select` gerekir.** Bağlantı satırları değil,
etiketlerin kendisi dönmeli:

```js
export const selectTodoTags = async (todoId) => {
  const satirlar = await prisma.todoTag.findMany({
    where: { todoId },
    select: { tag: { select: { id: true, name: true } } },
    orderBy: { tag: { name: "asc" } },
  });
  return satirlar.map((satir) => satir.tag);
};
```

**3. Bağlantıyı silmek etiketi silmez.** `DELETE /todos/:id/tags/:tagId` yalnızca
`todo_tags` satırını kaldırır; `tags` tablosundaki kayıt durur. Bir test bunu
kontrol ediyor.

**4. Todo silinince bağlantıları da silinmeli.** Bunu kodla değil, şemadaki
`onDelete: Cascade` ile sağlayın.

**5. Modüller arası çağrı kuralı hâlâ geçerli.** `todos` modülü etiketin var
olup olmadığını kontrol ederken `tags` modülünün **service**'ini çağırsın,
db katmanını değil.

## Aşama 5 — filtrelemeyi veritabanına taşımak

*Testler: `04-filters` — 3 test*

Hafta 2'de bonus olan `?completed=` ve `?q=` filtrelemesi bu hafta **zorunlu**
— ve artık bellekte değil, `WHERE` ile.

### Dikkat edilecekler

**1. Query değerleri her zaman metindir.** `?completed=true` size `"true"`
verir, `true` değil. Dönüşümü siz yapın:

```js
if (completed === "true" || completed === "false") {
  filtreler.completed = completed === "true";
}
```

**2. Harf duyarsız arama:**

```js
where.OR = [
  { title: { contains: q, mode: "insensitive" } },
  { description: { contains: q, mode: "insensitive" } },
];
```

`mode: "insensitive"` PostgreSQL'in `ILIKE`'ına çevriliyor.

**3. Filtreleme service'te değil db katmanında yapılmalı.** Bütün kayıtları
çekip JavaScript'te süzerseniz testler yine geçer — ama 10 milyon satırda
uygulama durur. Bu haftanın konusu tam olarak buydu.

## Aşama 6 — şifreyi hiç çekmemek

Hafta 2'de `password`'ü yanıttan **ayıklıyordunuz**. Bu hafta veritabanından
**hiç okumayın**:

```js
// users.db.js
const secim = { id: true, username: true, email: true, createdAt: true };
```

Ayıklamayı unutabilirsiniz; çekmediğiniz veriyi sızdıramazsınız. Yeni bir
endpoint yazan takım arkadaşınızın `publicUser`'ı çağırmayı unutması an
meselesi — `select` bu riski ortadan kaldırır.

> Bu maddeyi otomatik test ölçemez (HTTP'den bakınca "ayıklandı" ile
> "çekilmedi" aynı görünür). Kod okunarak değerlendirilecek.

---

# Puanlama

| Test dosyası | Test | Puan |
|---|---|---|
| `00-warmup` · `01-todos` | 14 | 30 |
| `02-users` · `03-relations` | 10 | 20 |
| `04-filters` | 3 | 10 |
| `05-priority` | 6 | 15 |
| `06-profile` | 6 | 10 |
| `07-tags` | 10 | 15 |
| **Toplam** | **49** | **100** |

Ayrıca kod okunarak değerlendirilecek: `select` ile şifrenin hiç çekilmemesi,
filtrelemenin db katmanında olması, katman sınırlarına uyulması.

---

# Sık yapılan hataların özeti

| Belirti | Sebebi |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | `.env` yüklenmemiş. `nodemon` `.env` okumaz; `node --env-file` kullanın |
| `null value in column "id"` | Tablo Prisma'nın, `INSERT` hâlâ ham SQL. db katmanını Prisma'ya geçirin |
| `PrismaClientValidationError` | Şemayı değiştirdiniz ama `prisma generate` çalışmadı |
| `GET /todos` boş nesne `{}` dönüyor | Controller'da `await` unutulmuş; `res.json()` Promise'i `{}` yapar |
| Olmayan kayıtta 404 yerine 500 | `update`/`delete` fırlatıyor; `updateMany`/`deleteMany` kullanın |
| `userId` yanıtta `null` | `row.user_id` okunuyor. Prisma `@map` sayesinde `userId` döndürür |
| İkinci `npm test` çalıştırmasında 409 | Test veritabanı temizlenmemiş — `helper.js`'i güncellemişsiniz |
| `?completed=true` işe yaramıyor | Query değeri `"true"` metni; boolean'a çevirmemişsiniz |
| Testler birbirini bozuyor | `--test-concurrency=1` kaldırılmış |

Takıldığınız yerde sorun — özellikle bir test neden geçmiyor anlamıyorsanız,
`assert` mesajları size ne beklediğini söylüyor.
