# Ödev 2 — Todo API'yi tamamla

> **Ödev 3 yayında:** [`ODEV-3.md`](ODEV-3.md) — bu ödevin üzerine kuruluyor.

> İTÜ ACM DevTeam Bootcamp 2026 · Ders 2: HTTP, REST API ve Modüler Monolit
>
> 📋 [Ödevin tarayıcıda okunabilir hâli (ilerleme takipli)](https://claude.ai/code/artifact/ad33091b-3a10-4d38-81a8-b49b8f3791a7)
> · 📡 [Ders 2 materyali](https://claude.ai/code/artifact/e2c90fc6-ac0d-4aa2-8336-f05912f843da)

Derste birlikte yazdığımız API'nin yarısı duruyor: `GET /todos`, `POST /todos`
ve `GET /todos/:id` çalışıyor. Bu ödevde onu tamamlayacak, yanına ikinci bir
modül ekleyecek ve iki modülü birbirine bağlayacaksınız.

Bu metin uzun — çünkü derste değinmediğimiz birkaç konuyu (git fork akışı,
istek atma araçları, query parametreleri) sıfırdan anlatıyor. Ödevi yaparken
öğreneceğiniz şeyler kodun kendisinden ibaret değil.

Bu proje kampın sonuna kadar sizinle gelecek. Önümüzdeki hafta buradaki
in-memory dizinin yerini PostgreSQL alacak — ama router, validator, controller
ve service katmanlarınız aynı kalacak. Yani bu hafta kurduğunuz yapı, gelecek
haftaların da temeli.

---

# Bölüm 1 · Git: fork ve güncelleme akışı

Derste git'e girmedik, o yüzden buradaki her adımı tek tek açıklıyorum. Bu akış
açık kaynak dünyasının standart çalışma şekli — bir kere öğrendiğinizde
GitHub'daki hemen her projeye katkı verirken aynısını kullanacaksınız.

## Önce kavramlar

| Terim | Ne demek |
|---|---|
| **repository (repo)** | Projenin tüm dosyaları **ve tüm geçmişi**. Git bir yedekleme aracı değil, bir *geçmiş* aracıdır. |
| **clone** | Uzaktaki bir repoyu, geçmişiyle birlikte kendi bilgisayarınıza indirmek. |
| **remote** | Reponuzun bağlı olduğu uzak bir adres. Bir reponun birden fazla remote'u olabilir. |
| **origin** | Klonladığınız adrese git'in verdiği varsayılan isim. Sizin durumunuzda: kendi fork'unuz. |
| **upstream** | "Yukarı akış" — asıl kaynak repo. Bu bir git komutu değil, sizin koyduğunuz bir isimdir; gelenek böyle. |
| **fork** | Bir reponun, GitHub üzerindeki *sizin hesabınızdaki* kopyası. |
| **branch** | Dal. Bu repoda `master` dalını kullanıyoruz. |
| **commit** | Kaydedilmiş bir değişiklik paketi. |

## Neden fork'luyoruz?

Ana repo (`ituacm/DevTeam-Bootcamp-2026`) herkesin ortak deposu ve sizin oraya
yazma yetkiniz yok — olmaması da doğru, yoksa 40 kişi aynı dosyaları
birbirinin üzerine yazardı.

**Fork**, o reponun sizin GitHub hesabınızdaki bağımsız bir kopyasıdır. Kendi
kopyanızda istediğinizi yaparsınız. Ama bu kopya, nereden geldiğini unutmaz —
işte bu sayede biz ana repoya yeni haftalar ve yeni testler eklediğimizde,
sizin çalışmanızı bozmadan onları kopyanıza çekebilirsiniz.

Kurulum sonrasında bilgisayarınızdaki repo iki uzak adres tanıyacak:

```
                   (yazma yetkiniz yok)
    ituacm/DevTeam-Bootcamp-2026  ─── fork ───▶  siz/DevTeam-Bootcamp-2026
              │                                          │
              │ upstream                                 │ origin
              │ (buradan çekersiniz)                     │ (buraya push edersiniz)
              └──────────────▶ bilgisayarınız ◀──────────┘
```

## Adım adım kurulum

**1.** GitHub'da ana reponun sayfasına gidin ve sağ üstteki **Fork** düğmesine
basın. Artık `github.com/<kullanici-adiniz>/DevTeam-Bootcamp-2026` diye bir
repo var.

**2.** Kendi fork'unuzu bilgisayarınıza indirin:

```bash
git clone https://github.com/<kullanici-adiniz>/DevTeam-Bootcamp-2026.git
```

> **`git clone` ne yapar?** Uzak repoyu tüm geçmişiyle indirir, klasörü
> oluşturur ve indirdiği adresi otomatik olarak `origin` adıyla kaydeder.
> Buradan sonra `git push` dediğinizde varsayılan olarak oraya gider.
>
> **Neden burada?** Kendi fork'unuz üzerinde çalışacaksınız.

**3.** Bağımlılıkları kurun:

```bash
cd DevTeam-Bootcamp-2026/project
npm install
```

> **`npm install` ne yapar?** `package.json` içinde yazan paketleri (burada
> sadece Express) indirip `node_modules/` klasörüne koyar. Bu klasör
> `.gitignore`'da — git'e commit edilmez, çünkü herkes kendi bilgisayarında
> yeniden üretebilir.

**4.** Ana repoyu ikinci bir remote olarak tanıtın:

```bash
git remote add upstream https://github.com/ituacm/DevTeam-Bootcamp-2026.git
```

> **`git remote add <isim> <url>` ne yapar?** Repoya yeni bir uzak adres
> tanıtır ve ona bir isim verir. `upstream` sadece bir isimdir; `ana-repo` da
> diyebilirdiniz, ama herkes `upstream` dediği için siz de öyle deyin.
>
> **Neden burada?** Klonladığınız kopya yalnızca kendi fork'unuzu bilir. Ana
> repodan güncelleme çekebilmeniz için önce onun adresini tanıtmanız gerekir.

Doğru yaptığınızı kontrol edin:

```bash
git remote -v
```

İki isim de listede görünmeli: `origin` sizin fork'unuz, `upstream` ana repo.

## Güncellemeleri çekmek

Kampın ilerleyen haftalarında ana repoya yeni klasörler ve yeni testler
ekleyeceğiz. Kendi çalışmanızı kaybetmeden onları almak için iki komut:

```bash
git fetch upstream
git merge upstream/master
```

> **`git fetch upstream` ne yapar?** Ana repodaki yeni commit'leri
> bilgisayarınıza **indirir** — ama çalıştığınız dosyalara *dokunmaz*. Sadece
> "upstream'de şunlar var" bilgisini kaydeder. Güvenli bir komuttur; hiçbir
> şeyinizi bozmaz.
>
> **`git merge upstream/master` ne yapar?** İndirilen o değişiklikleri şu an
> çalıştığınız dala **uygular**. Dosyalarınız burada değişir.
>
> **Neden ikisi ayrı ayrı?** `git pull` bu ikisini tek komutta yapar. Ayrı
> yapmanızı öneriyoruz çünkü `fetch` sonrası `git log HEAD..upstream/master`
> ile *ne geleceğini* görebilirsiniz. Körlemesine birleştirmemiş olursunuz.

### Çakışma (conflict) nedir, nasıl kaçınırsınız?

Aynı dosyanın aynı satırını hem siz hem biz değiştirdiysek, git hangisinin
doğru olduğunu bilemez ve dosyaya `<<<<<<<` işaretleri koyup size sorar. Buna
**merge conflict** denir.

Bundan kaçınmanın en kolay yolu: **bizim güncelleyeceğimiz dosyalara
dokunmamak.**

```
⚠️  tests/          — dokunmayın
⚠️  tests-bonus/    — dokunmayın
⚠️  index.js        — dokunmayın
⚠️  package.json    — dokunmayın
```

Kendi kodunuz `app.js`, `modules/` ve `utils/` altında; oraları biz
değiştirmeyeceğiz.

## Çalışmanızı kaydetmek

```bash
git status
git add .
git commit -m "Aşama 1: todos CRUD tamamlandı"
git push
```

> **`git status`** — hangi dosyaların değiştiğini gösterir. Her commit'ten önce
> bakma alışkanlığı edinin.
>
> **`git add .`** — değişen dosyaları "commit edilecekler" listesine alır.
> Nokta "bulunduğum klasördeki her şey" demek.
>
> **`git commit -m "..."`** — o listedeki değişiklikleri, açıklamasıyla birlikte
> geçmişe kaydeder. Tek seferde her şeyi commit etmek yerine aşama aşama
> commit atın; hem geçmişiniz okunur olur hem bir şeyi bozduğunuzda geri
> dönecek bir noktanız olur.
>
> **`git push`** — yerel commit'lerinizi `origin`'e, yani fork'unuza gönderir.

---

# Bölüm 2 · Projeyi çalıştırma ve test etme

Sunucuyu ayağa kaldırmak için:

```bash
npm run dev
```

`node --watch index.js` çalıştırır: bir dosyayı kaydettiğinizde sunucu
kendiliğinden yeniden başlar. (Derste `nodemon` kullanmıştık; `--watch`
Node'un kendi içine gelen aynı işi yapan özelliği, ekstra paket gerektirmiyor.)

Kendinizi kontrol etmek için:

```bash
npm test
```

Bonus görevleri de denemek için:

```bash
npm run test:bonus
```

## Testler nasıl çalışıyor?

Testler uygulamanızı **rastgele boş bir portta ayağa kaldırıp gerçek HTTP
istekleri atar** ve dönen status kodu ile gövdeyi kontrol eder. Yani sizin
kodunuzu içeriden çağırmaz; tıpkı bir tarayıcı ya da Postman gibi dışarıdan
konuşur.

Bunun bir sonucu var: **`app.js` içinde `listen()` çağırmayın.** O dosya
sadece Express uygulamasını kurup `export default` ile dışarı verir:

```js
const server = express();
// ... middleware ve route'lar
export default server;
```

Sunucuyu başlatan tek yer `index.js`. Böylece testler aynı uygulamayı alıp
kendi portlarında çalıştırabiliyor. Bu, gerçek projelerde de yaygın bir
ayrımdır: *uygulamayı kurmak* ile *uygulamayı dinlemeye başlatmak* iki ayrı iş.

Hiçbir şey yazmadan `npm test` çalıştırdığınızda **24 testin 6'sı** geçer —
bunlar derste yazdığımız kodun zaten çalışan kısmı. Hedefiniz 24/24.

## Test çıktısını okumak

Bir test başarısız olduğunda Node size şunu gösterir:

```
✖ PUT /todos/:id → 200, id korunur, alanlar değişir
  AssertionError: Önce PUT /todos/:id route'unu ekleyin.
  + actual - expected
  + 404
  - 200
```

- İlk satır **hangi testin** patladığı,
- `AssertionError` satırı **ne beklendiğine dair açıklama**,
- `actual` sizin döndürdüğünüz, `expected` beklenen değer.

Testlerin hata mesajlarını ipucu verecek şekilde yazdım; takıldığınızda önce
onları okuyun.

---

# Bölüm 3 · İstek atma araçları

Tarayıcının adres çubuğu yalnızca `GET` isteği atabilir. `POST`, `PUT`, `PATCH`
ve `DELETE` denemek için bir istemciye ihtiyacınız var. Üç seçeneğiniz var,
üçü de aynı işi yapar; hangisini severseniz onu kullanın.

## Seçenek 1 · Postman (derste kullandığımız)

[postman.com/downloads](https://www.postman.com/downloads/) adresinden indirin.

**Bir istek atmak:**

1. Sol üstten **New → HTTP Request** (ya da `+` sekmesi).
2. Soldaki açılır menüden metodu seçin: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
3. Yanına adresi yazın: `http://localhost:3000/todos`
4. Gövde göndereceksiniz (`POST`, `PUT`, `PATCH`) → **Body** sekmesi →
   **raw** seçeneği → sağdaki açılır menüden **JSON** seçin.
5. JSON'unuzu yazın ve **Send**.

> ⚠️ **En sık yapılan hata:** 4. adımda "raw"ın yanındaki menüden **JSON**
> seçmeyi unutmak. O menü aslında `Content-Type` başlığını ayarlıyor. `Text`
> kalırsa istek `Content-Type: text/plain` ile gider, `express.json()` gövdeyi
> parse etmez, `req.body` boş kalır ve siz "ama gönderdim!" derken 400
> alırsınız.

**Yanıtı okumak:** Alt panelde gövde görünür. Sağ üstte **status kodu**, süre
ve boyut yazar. **Headers** sekmesinden yanıt başlıklarını görebilirsiniz —
`Content-Type: application/json` orada.

**İşinizi kolaylaştıracak iki şey:**

- **Collection** oluşturup isteklerinizi kaydedin; her seferinde baştan
  yazmayın.
- Collection'a **variable** tanımlayın: `host` = `http://localhost:3000`, sonra
  adreslerde `{{host}}/todos` yazın. Portu değiştirdiğinizde tek yerden
  düzeltirsiniz.

## Seçenek 2 · REST Client (VS Code eklentisi)

İstekleriniz kodunuzun yanında, düz metin dosyası olarak, git'te versiyonlanmış
şekilde durur. Ayrı program açmanız gerekmez.

**Kurulum:** VS Code'da `Ctrl+Shift+X` ile Extensions panelini açın, arama
kutusuna **REST Client** yazın, yayıncısı **Huachao Mao** olanı kurun.

**Kullanım:** Projede hazır bir [`istekler.http`](istekler.http) dosyası var.
Açın; her isteğin üstünde küçük bir **Send Request** yazısı belirir, tıklayın.
Yanıt yandaki panelde açılır — status satırı, başlıklar ve gövde birlikte.

**Dosya biçimi:**

```http
@host = http://localhost:3000

### Tüm todoları getir
GET {{host}}/todos

### Yeni todo ekle
POST {{host}}/todos
Content-Type: application/json

{
  "title": "Ödevi bitir",
  "description": "Hafta 2 REST API"
}
```

Kuralları tek tek:

- `###` satırı istekleri birbirinden ayırır. Yanına yazdığınız metin başlık
  olur.
- İlk satır her zaman `METOD adres` biçiminde.
- Sonraki satırlar **başlıklar** (`Content-Type: application/json` gibi).
- Başlıklarla gövde arasında **boş bir satır** olmak zorunda. Bu tesadüf değil:
  derste gördüğümüz ham HTTP isteğinde de başlıklarla gövdeyi ayıran şey o boş
  satırdı. Bu dosya biçimi neredeyse birebir HTTP'nin kendisi.
- `@host = ...` bir değişken tanımlar, `{{host}}` ile kullanılır.

**Zincirleme istekler:** Bir isteğe isim verip yanıtından değer okuyabilirsiniz.
Bu özellikle "oluştur, sonra oluşanı güncelle" akışlarında çok işe yarar:

```http
# @name yeniTodo
POST {{host}}/todos
Content-Type: application/json

{ "title": "a", "description": "b" }

### Az önce oluşturulanı sil
DELETE {{host}}/todos/{{yeniTodo.response.body.id}}
```

## Seçenek 3 · curl (terminal)

Her yerde var; bir sunucuya SSH ile bağlandığınızda tek seçeneğiniz bu olabilir.

```bash
curl -i http://localhost:3000/todos
```

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Ödevi bitir","description":"Hafta 2"}'
```

`-i` bayrağı yanıt başlıklarını da yazdırır; status kodunu böyle görürsünüz.
`-X` metodu, `-H` bir başlığı, `-d` gövdeyi belirtir.

---

# Bölüm 4 · Klasör yapısı

```
project/
├── index.js                 ⚠️ dokunmayın — sunucuyu başlatır
├── app.js                      düzenleyeceksiniz
├── istekler.http               hazır istekler
├── modules/
│   ├── todos/                  yarısı hazır, tamamlayacaksınız
│   │   ├── todos.router.js
│   │   ├── todos.validator.js
│   │   ├── todos.controller.js
│   │   └── todos.service.js
│   └── users/                  boş iskelet, sizin yazacağınız
│       ├── users.router.js
│       ├── users.validator.js
│       ├── users.controller.js
│       └── users.service.js
├── utils/
│   ├── notFoundHandler.js
│   └── globalErrorHandler.js
├── tests/                   ⚠️ dokunmayın
└── tests-bonus/             ⚠️ dokunmayın
```

`modules/users/` altındaki dört dosya şu an sadece yorum satırı içeriyor. Her
birinin başında o katmanda ne yazmanız gerektiği yazılı.

**Katmanların sorumlulukları** (derste konuştuğumuzun hatırlatması):

| Katman | Ne yapar | Ne yapmaz |
|---|---|---|
| `router` | Yol ve metodu doğru zincire bağlar | İş yapmaz, veri okumaz |
| `validator` | Gelen veriyi doğrular, hatalıysa `400` ile zinciri keser | Veriyi kaydetmez |
| `controller` | `req`'ten okur, service'i çağırır, status kodunu seçer, yanıtı yazar | İş kuralı içermez |
| `service` | İş kuralları ve veri işlemleri | `req` / `res` **görmez** |

---

# Bölüm 5 · Middleware nasıl çalışır?

Aşama 0'a geçmeden önce bunu netleştirelim, çünkü ödevin yarısı bu mantığa
dayanıyor.

## Express aslında sıralı bir fonksiyon listesidir

Bir Express uygulaması, yukarıdan aşağıya sıralanmış bir fonksiyon listesinden
ibarettir. Her fonksiyon aynı imzayı taşır:

```js
(req, res, next) => { ... }
```

Bir istek geldiğinde Express bu listeyi **tanımlanma sırasına göre** yukarıdan
aşağıya gezer ve isteğe uyan her halkayı sırayla çalıştırır.

```
istek ──▶ express.json() ──▶ /todos router ──▶ validator ──▶ controller ──▶ yanıt
```

## Bir halkanın üç çıkışı vardır

Zincirdeki her fonksiyon şu üçünden **tam olarak birini** yapmak zorundadır:

| Ne yaparsa | Ne olur |
|---|---|
| `next()` | Sıradaki halkaya geçilir. |
| `res.json(...)` / `res.status(...).send(...)` | Yanıt yazılır, **zincir orada biter.** Aşağıdaki hiçbir şey çalışmaz. |
| `next(err)` | Kalan halkalar atlanır, doğrudan hata middleware'ine sıçranır. |

Üçünden hiçbirini yapmazsanız istek **asılı kalır**: istemci yanıtı bekler,
sonunda timeout'a düşer ve sunucu logunda hiçbir hata görünmez. Sessiz olduğu
için en zor fark edilen hatadır.

## Halka nereye takılır?

| Yazım | Nerede çalışır |
|---|---|
| `server.use(fn)` | **Her** istekte — yol filtresi yok |
| `server.use("/todos", router)` | Yolu `/todos` ile başlayan her istekte |
| `server.get("/", fn)` | Sadece `GET /` isteğinde |
| `r.post("/", validate, controller)` | Sadece o route'ta, **soldan sağa sırayla** |

Son satır, derste "middleware chaining" dediğimiz şey: virgülle ayırdığınız her
fonksiyon, bir öncekinin `next()` çağırması şartıyla sırayla çalışır.

## Sıra bir tercihtir, tesadüf değil

`express.json()`'ı route'lardan **önce** yazıyoruz, çünkü controller
`req.body`'yi okuyacaksa gövdenin ondan önce parse edilmiş olması gerekir.
Validator'ı controller'dan **önce** yazıyoruz, çünkü hatalı veriyle iş
yapmasın. Aynı mantıkla, "hiçbir şey eşleşmedi" anlamına gelen
`notFoundHandler` **en sonda** olmalı.

---

# Bölüm 6 · Aşamalar

Sırayla ilerleyin; her aşamanın kendi test dosyası var.

---

## Aşama 0 · Isınma — `tests/00-warmup.test.js` (2 test) — 5 puan

Derste yazdığımız kodda bir hata kaldı: **`GET /` şu an 200 yerine 404
dönüyor.**

### Hata tam olarak ne?

`app.js` şu anda şöyle:

```js
server.use(express.json());

server.use("/todos", todosRouter);

server.use(notFoundHandler);      // ← her yolu yakalar
server.use(globalErrorHandler);

server.get("/", (req, res) => {   // ← buraya asla sıra gelmez
  res.send("Hello World");
});
```

`GET /` isteği geldiğinde Express listeyi yukarıdan aşağıya geziyor:

1. `express.json()` çalışır, `next()` der.
2. `/todos` router'ı — yol eşleşmiyor (`/` ≠ `/todos` ile başlayan bir şey),
   atlanır.
3. `notFoundHandler` — `server.use(fn)` biçiminde, yani **yol filtresi yok**,
   her isteğe uyar. Çalışır, `res.status(404).json(...)` ile yanıtı yazar ve
   `next()` **çağırmaz**.
4. Zincir burada biter. Aşağıdaki `server.get("/")` hiç denenmez.

### Neden bu hata bu kadar öğretici?

Çünkü kod **hatasız çalışıyor**. Terminalde bir uyarı yok, bir exception yok.
Sadece yanlış sonuç dönüyor. Middleware sırasıyla ilgili hatalar genellikle
böyledir — ve bu yüzden Express'te sıra, bir stil meselesi değil, davranışın
kendisidir.

### Ne yapacaksınız?

`notFoundHandler` ve `globalErrorHandler`'ı **tüm route tanımlarının en altına**
taşıyın. Anlamları zaten bu: "buraya kadar hiçbir şey eşleşmediyse".

### Dikkat edilecekler

- `globalErrorHandler` **en sonda**, `notFoundHandler`'dan da sonra olmalı.
- Hata middleware'inin `(err, req, res, next)` şeklinde **dört parametreli**
  olması bir tercih değil zorunluluk: Express bir fonksiyonu "hata
  middleware'i" olarak yalnızca parametre sayısına bakarak tanır. Üç parametre
  yazarsanız sıradan bir middleware sayılır ve hiç çalışmaz.
- Aşama 2'de `users` router'ını eklerken onu da `notFoundHandler`'dan **önce**
  koymayı unutmayın; yoksa aynı hatayı bu kez kendiniz yapmış olursunuz.

---

## Aşama 1 · todos modülünü tamamla — `tests/01-todos.test.js` (12 test) — 40 puan

Eksik üç endpoint'i **dört katmana yayarak** ekleyin.

| İstek | Davranış | Yanıt |
|---|---|---|
| `PUT /todos/:id` | **Tam güncelleme.** `title`, `description`, `completed` üçü de zorunlu. Aynı `id` korunur, yeni id üretilmez. | `200` / `400` / `404` |
| `PATCH /todos/:id` | **Kısmi güncelleme.** Gönderilen alanlar değişir, gönderilmeyenler korunur. Boş gövde kabul edilmez. | `200` / `400` / `404` |
| `DELETE /todos/:id` | Kaydı siler. Yanıtın **gövdesi boş olmalı**. | `204` / `404` |

### PUT ile PATCH farkı

Bu ikisi sık karıştırılır. Ayrım şu:

- **PUT = "bu kaynağı şununla değiştir".** Gönderdiğiniz gövde kaynağın yeni
  hâlinin tamamıdır. Bu yüzden tüm alanlar zorunludur — bir alanı
  göndermezseniz onu silmiş olursunuz.
- **PATCH = "bu kaynakta şunu değiştir".** Yalnızca değişecek alanları
  gönderirsiniz, gerisi olduğu gibi kalır.

Derste konuştuğumuz **idempotency** farkı buradan geliyor: PUT'u on kere atmak
bir kere atmakla aynı sonucu verir.

### Dikkat edilecekler

**1. `id`'yi client değiştiremez.** PUT'ta kaydı yeniden kurarken id'yi elle
taşıyın:

```js
todos[i] = { id: todos[i].id, title, description, completed };
```

Gövdeden gelen `req.body.id` varsa bile onu **kullanmayın**.

**2. `return` yazmayı unutmayın.** Bu, ödevde en sık patlayan yer:

```js
// ✗ 404 yazıldı ama kod devam ediyor → ERR_HTTP_HEADERS_SENT
if (!todo) res.status(404).json({ error: "Todo not found" });
res.json(todo);

// ✓
if (!todo) return res.status(404).json({ error: "Todo not found" });
res.json(todo);
```

**3. PATCH'te `undefined` kontrolü yapın, doğruluk kontrolü değil.**

```js
// ✗ completed:false gönderildiğinde çalışmaz — false "yanlış" sayılır
if (alanlar.completed) todo.completed = alanlar.completed;

// ✓ "gönderildi mi?" sorusunun doğru sorulma şekli
if (alanlar.completed !== undefined) todo.completed = alanlar.completed;
```

**4. `DELETE` için `204` dönerken gövde yazmayın.**

```js
res.status(204).send();     // ✓
res.status(204).json({});   // ✗ 204 gövde taşıyamaz
```

**5. Diziden eleman silmek.** `todos` bir `const` olduğu için ona yeniden atama
yapamazsınız:

```js
todos = todos.filter(...);   // ✗ TypeError: Assignment to constant variable

const i = todos.findIndex((t) => t.id === id);
if (i === -1) return false;
todos.splice(i, 1);          // ✓ diziyi yerinde değiştirir
return true;
```

**6. Katmanları karıştırmayın.** Service `res` görmez. "Bulamadım" bilgisini
service `undefined` (ya da `false`) döndürerek verir; `404` seçmek
controller'ın işidir. Doğrulama ise controller'ın içinde `if` yığını olarak
değil, `todos.validator.js` içinde middleware olarak yazılır ve router'da
zincirlenir.

**7. `req.params.id` her zaman string'tir.** Bizim id'lerimiz `crypto.randomUUID()`
ile üretildiği için zaten string — `Number()` ile çevirmeye **çalışmayın**,
`NaN` alırsınız.

---

## Aşama 2 · users modülünü sıfırdan yaz — `tests/02-users.test.js` (5 test) — 30 puan

`modules/users/` altındaki dört katmanı doldurun ve router'ı `app.js`'e
bağlayın.

| İstek | Davranış | Yanıt |
|---|---|---|
| `POST /users` | `username`, `email`, `password` zorunlu. `email` en azından `@` içermeli. Aynı e-posta ikinci kez kayıt olamaz. | `201` / `400` / `409` |
| `GET /users` | Tüm kullanıcıları listeler. | `200` |

### Dikkat edilecekler

**1. `password` hiçbir yanıtta dönmeyecek.** Bellekte saklanır ama yanıta
konmaz. Doğru yöntem, password'ü ayıklanmış bir **kopya** döndürmektir:

```js
// ✓ orijinal kayda dokunmadan password'süz bir kopya üretir
export const publicUser = ({ id, username, email, createdAt }) => ({
  id, username, email, createdAt,
});
```

```js
// ✗ ASLA: bellekteki asıl kaydı kalıcı olarak bozar
delete user.password;
```

Test `"password" in yanit` diye bakıyor — yani alanın değeri değil, **varlığı**
kontrol ediliyor.

**2. `400` ile `409` farkı.** İkisi de "isteğin kabul edilmedi" der ama
sebepleri farklıdır:

- **`400 Bad Request`** — istek *biçimsel olarak* hatalı: alan eksik, tip
  yanlış, e-postada `@` yok. İstemci gövdeyi düzeltmeli.
- **`409 Conflict`** — istek gayet geçerli, ama sunucunun **mevcut durumuyla**
  çakışıyor: bu e-posta zaten kayıtlı. İstemcinin düzeltebileceği bir biçim
  hatası yok; başka bir e-posta denemeli.

Bu ayrım nerede kontrol yapacağınızı da söylüyor: biçim kontrolü **validator**'a
(gövdeye bakar, veriye bakmaz), benzersizlik kontrolü **controller/service**'e
(mevcut kayıtlara bakması gerekir) aittir.

**3. Katman tekrarı iyi bir şeydir.** `users` modülünü yazarken `todos`
modülüne bakıp aynı iskeleti kurun. Modüler monolitin bütün amacı bu: bir
modülü tanıyan, diğerinde de nereye bakacağını bilir.

**4. Router'ı bağlamayı unutmayın:**

```js
server.use("/users", usersRouter);   // notFoundHandler'dan ÖNCE
```

Bağlamazsanız bütün users testleri 404 alır ve "kodu yazdım ama çalışmıyor"
dersiniz.

---

## Aşama 3 · İki modülü birbirine bağla — `tests/03-relations.test.js` (5 test) — 25 puan

| İstek | Davranış | Yanıt |
|---|---|---|
| `POST /todos` | Gövdede **isteğe bağlı** `userId` kabul eder. Gönderildiyse gerçekten var olan bir kullanıcıyı göstermeli. Gönderilmediyse todo sahipsizdir (`userId: null`). | `201` / `400` |
| `GET /users/:id/todos` | O kullanıcıya ait todoları döner. Sahipsizler ve başkasının todoları dahil edilmez. | `200` / `404` |

### Altın kural burada devreye giriyor

Derste konuştuğumuz kural: **bir modül başka bir modülün `service` katmanını
çağırabilir; controller'ına, validator'ına ya da veri dizisine doğrudan
dokunamaz.**

- `todos` tarafı, `userId`'nin geçerliliğini `users.service`'in
  `getUserById`'ını çağırarak kontrol eder.
- `users` tarafı, kullanıcının todolarını `todos.service`'in
  `getTodosByUserId`'ını çağırarak alır.

```js
// todos.validator.js
import { getUserById } from "../users/users.service.js";
```

Neden bu kural? Çünkü bir modülün *service*'i, o modülün dışarıya verdiği
sözdür — orası değişmediği sürece iç yapısı serbestçe değişebilir. Gelecek
hafta `users.db` PostgreSQL'e taşındığında, `todos` modülü hiçbir şey fark
etmeyecek. Ama `todos` bugün doğrudan `users`'ın dizisini okusaydı, o
değişiklikte kırılırdı.

### Dikkat edilecekler

**1. `userId` isteğe bağlı, ama gönderildiyse geçerli olmalı.** İki durumu
ayırın:

```js
if (userId !== undefined && userId !== null) {
  if (!getUserById(userId)) {
    return res.status(400).json({ error: "User not found" });
  }
}
```

Gönderilmediyse todo `userId: null` ile oluşur — bu bir hata değil.

**2. Olmayan kullanıcı için boş dizi değil `404` dönün.** `GET /users/<yok>/todos`
isteğinde "o kullanıcının 0 todosu var" demek yanlış olur; **öyle bir kullanıcı
yok**. Bu ikisi farklı bilgilerdir ve API'nizin bunu ayırt etmesi gerekir.

**3. Döngüsel import'a dikkat.** `todos.validator` → `users.service` ve
`users.controller` → `todos.service` yönleri birbirini kesmez, sorun yok. Ama
iki *service*'in birbirini import etmesinden kaçının; ES modüllerinde döngüsel
import sessizce `undefined` üretebilir.

**4. Sahipsiz todolar filtreye takılmasın.** `getTodosByUserId` yazarken
`todo.userId === userId` karşılaştırması yapın; `userId: null` olanlar
kendiliğinden dışarıda kalır.

---

## Bonus · Filtreleme ve arama — `tests-bonus/04-filters.test.js` (3 test) — +10 puan

Bu konuyu derste anlatmadım, o yüzden kodun tamamını aşağıda veriyorum.
Kopyalayıp yapıştırmak yerine okuyup anlamanızı öneririm — özellikle ilk
uyarıyı.

| İstek | Davranış |
|---|---|
| `GET /todos?completed=true` | Yalnızca tamamlananlar. `false` için tersi. |
| `GET /todos?q=market` | `title` **veya** `description` içinde geçenler, büyük/küçük harfe duyarsız. |
| `GET /todos?completed=true&q=rapor` | İki filtre birlikte çalışır. |

### Query parametresi nedir?

Adresin `?` işaretinden sonraki kısmı **query string**'dir. Kaynağın kendisini
değil, o kaynağın *nasıl* getirileceğini anlatır:

```
/todos?completed=true&q=rapor
└─────┘ └────────────┘ └─────┘
 kaynak    1. parametre  2. parametre    (& ile ayrılır)
```

Express bunu sizin için ayrıştırır ve `req.query` nesnesine koyar:

```js
req.query   // → { completed: "true", q: "rapor" }
```

> ⚠️ **En kritik nokta:** `req.query` içindeki değerler **her zaman
> string**'tir. HTTP'de adres satırı düz metindir; orada boolean ya da sayı
> diye bir şey yoktur.
>
> ```js
> req.query.completed === true     // ✗ HİÇBİR ZAMAN doğru olmaz
> req.query.completed === "true"   // ✓ doğru karşılaştırma
> ```
>
> Aynı şey sayılar için de geçerli: `?limit=10` size `"10"` verir, `10`
> değil.

### Filtreleme neden service katmanında?

Çünkü "hangi todolar dönecek" bir **iş kuralıdır**, HTTP'ye ait bir detay
değil. Controller'ın işi `req.query`'yi okuyup service'e aktarmak; süzme
işlemini service yapar. Böylece aynı filtreleme mantığını yarın başka bir
yerden de çağırabilirsiniz.

### Kod

**`todos.service.js`** — `getTodos` fonksiyonunu parametre alacak şekilde
genişletin:

```js
export const getTodos = ({ completed, q } = {}) => {
  let sonuc = todos;

  // --- completed filtresi ---
  // completed bir string: "true", "false" ya da undefined.
  // Sadece bu iki değerden biriyse filtre uygula; başka bir şey geldiyse
  // (ör. ?completed=belki) filtreyi yok say.
  if (completed === "true" || completed === "false") {
    const beklenen = completed === "true";   // string → boolean
    sonuc = sonuc.filter((todo) => todo.completed === beklenen);
  }

  // --- q araması ---
  if (typeof q === "string" && q.trim() !== "") {
    const arama = q.toLowerCase();
    sonuc = sonuc.filter(
      (todo) =>
        todo.title.toLowerCase().includes(arama) ||
        todo.description.toLowerCase().includes(arama),
    );
  }

  return sonuc;
};
```

**`todos.controller.js`** — query'yi okuyup service'e geçirin:

```js
export const getTodosController = (req, res) => {
  const { completed, q } = req.query;
  res.json(getTodos({ completed, q }));
};
```

### Bu kodda dikkat edilecek üç ayrıntı

**1. `= {}` varsayılan parametresi.** `getTodos()` hiç argümansız da
çağrılabilmeli (başka bir yerden öyle çağırıyor olabilirsiniz). Varsayılan
boş nesne olmasaydı `undefined`'dan destructuring yapılamaz ve hata alırdınız.

**2. Filtreler zincirleniyor.** `sonuc` değişkenini her adımda yeniden atadığımız
için iki filtre birlikte çalışır — önce tamamlananlar süzülür, sonra o sonucun
içinde arama yapılır. `if/else` kullansaydınız yalnızca biri çalışırdı.

**3. `.filter()` yeni dizi döndürür, orijinali bozmaz.** `todos` dizisine
dokunmuyoruz; sadece süzülmüş bir kopya döndürüyoruz. Bu önemli — aksi hâlde
bir filtreleme isteği verinizi kalıcı olarak silerdi.

> **Küçük bir Türkçe notu:** `toLowerCase()` İngilizce kurallarına göre
> çalışır; `"I"` harfini `"i"`ye çevirir, `"ı"`ya değil. Tam Türkçe davranış
> için `toLocaleLowerCase("tr")` kullanılır. Testler ASCII metinlerle
> çalıştığı için burada `toLowerCase()` yeterli, ama gerçek bir Türkçe
> uygulamada bu ayrımı bilmek gerekir.

---

# Bölüm 7 · Veri modelleri

```js
User {
  id: string,        // crypto.randomUUID()
  username: string,
  email: string,
  password: string,  // saklanır, ASLA response'ta dönmez
  createdAt: Date
}

Todo {
  id: string,
  title: string,
  description: string,
  completed: boolean,     // varsayılan: false
  userId: string | null,  // isteğe bağlı
  createdAt: Date
}
```

---

# Bölüm 8 · Puanlama ve değerlendirme

| Bölüm | Test dosyası | Puan |
|---|---|---|
| Aşama 0 — ısınma | `00-warmup` | 5 |
| Aşama 1 — todos CRUD | `01-todos` | 40 |
| Aşama 2 — users modülü | `02-users` | 30 |
| Aşama 3 — modüller arası ilişki | `03-relations` | 25 |
| **Toplam** | | **100** |
| Bonus — filtreleme ve arama | `04-filters` | +10 |

Testleri geçmek gerekli ama tek başına yeterli değil. Ayrıca şunlara bakılacak:

- **Katmanlara uyum.** İş kuralı controller'da, HTTP status kodu service'te
  olmayacak. Service `req`/`res` görmeyecek.
- **Modül sınırları.** Bir modül başka modülün yalnızca service'ini çağıracak.
- **Doğrulama middleware olarak.** `if` yığını controller'ın içinde değil,
  validator dosyasında ve router'da zincirlenmiş.
- **Testleri değiştirerek geçmek geçersizdir.**

## Sık yapılan hataların özeti

| Belirti | Sebebi |
|---|---|
| `req.body` `undefined` geliyor | `express.json()` yok, ya da istemcide `Content-Type: application/json` gönderilmiyor |
| `ERR_HTTP_HEADERS_SENT` | Yanıt yazıldıktan sonra kod devam etmiş — `return` unutulmuş |
| İstek asılı kalıyor, timeout | Middleware ne `next()` çağırmış ne yanıt yazmış |
| Her yol 404 dönüyor | `notFoundHandler` route'lardan önce tanımlanmış |
| Yazdığınız route çalışmıyor | Router `app.js`'e bağlanmamış ya da `notFoundHandler`'dan sonra bağlanmış |
| `completed: false` PATCH'te işlemiyor | `if (x)` yazılmış, `if (x !== undefined)` yerine |
| `?completed=true` filtresi tutmuyor | `=== true` ile karşılaştırılmış, `=== "true"` yerine |
| Hata middleware'i hiç çalışmıyor | Üç parametreyle yazılmış, dört olmalı |

---

# Teslim

Çalışmanızı kendi fork'unuza push edin ve repo linkinizi paylaşın. Teslim
tarihi duyuru kanalından paylaşılacak.

Takıldığınız yerde sormaktan çekinmeyin — özellikle bir test neden geçmiyor
anlamıyorsanız, hata mesajını olduğu gibi atın.
