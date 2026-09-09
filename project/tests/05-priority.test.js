// Aşama 2 — migration ile şema değişikliği
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { patch, makeTodo, stop, OLMAYAN_ID } from "./helper.js";

after(stop);

test("prisma/migrations altında en az iki migration olmalı", () => {
  const dizin = path.join(process.cwd(), "prisma", "migrations");

  assert.ok(
    fs.existsSync(dizin),
    "prisma/migrations klasörü yok. `npx prisma migrate dev --name init` çalıştırdınız mı?",
  );

  const migrationlar = fs
    .readdirSync(dizin, { withFileTypes: true })
    .filter((girdi) => girdi.isDirectory());

  assert.ok(
    migrationlar.length >= 2,
    `Yalnızca ${migrationlar.length} migration var. Şemaya priority alanını ekleyip ` +
      "İKİNCİ bir migration üretmelisiniz — ilk migration'ı elle düzenlemek değil. " +
      "Migration'ın amacı, şemanın nasıl bu hâle geldiğinin kaydını tutmaktır.",
  );

  for (const m of migrationlar) {
    assert.ok(
      fs.existsSync(path.join(dizin, m.name, "migration.sql")),
      `${m.name} klasöründe migration.sql yok.`,
    );
  }
});

test("POST /todos priority göndermeden → priority 0", async () => {
  const res = await makeTodo({ title: "varsayılan öncelik" });

  assert.equal(res.status, 201);
  assert.equal(
    res.body.priority,
    0,
    "priority gönderilmediğinde 0 olmalı — bunu şemadaki @default(0) sağlar, controller değil.",
  );
});

test("POST /todos priority ile → gönderilen değer saklanır", async () => {
  const res = await makeTodo({ title: "acil iş", priority: 5 });

  assert.equal(res.status, 201);
  assert.equal(res.body.priority, 5);
});

test("PATCH /todos/:id ile priority güncellenir", async () => {
  const todo = await makeTodo({ title: "önceliği değişecek" });
  assert.equal(todo.status, 201);

  const res = await patch(`/todos/${todo.body.id}`, { priority: 3 });

  assert.equal(res.status, 200);
  assert.equal(res.body.priority, 3);
  assert.equal(
    res.body.title,
    "önceliği değişecek",
    "PATCH yalnızca gönderilen alanı değiştirmeli.",
  );
});

test("PATCH /todos/:id priority tam sayı değilse → 400", async () => {
  const todo = await makeTodo({ title: "geçersiz öncelik" });

  const res = await patch(`/todos/${todo.body.id}`, { priority: "yüksek" });

  assert.equal(
    res.status,
    400,
    "priority bir tam sayıdır; metin gönderilirse 400 dönmeli.",
  );
});

test("PATCH /todos/:id olmayan id → 404", async () => {
  const res = await patch(`/todos/${OLMAYAN_ID}`, { priority: 1 });
  assert.equal(res.status, 404);
});
