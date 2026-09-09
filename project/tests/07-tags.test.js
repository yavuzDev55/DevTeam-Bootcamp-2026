// Aşama 4 — çoka-çok ilişki: todo'lar ve etiketler
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { get, post, del, makeTodo, makeTag, stop, OLMAYAN_ID } from "./helper.js";

after(stop);

test("POST /tags → 201 ve oluşan etiket", async () => {
  const res = await makeTag("acil");

  assert.equal(res.status, 201);
  assert.equal(typeof res.body?.id, "string", "Yanıtta string bir id olmalı.");
  assert.equal(res.body.name, "acil");
});

test("POST /tags aynı isimle ikinci kez → 409", async () => {
  await makeTag("tekrar-eden");

  const res = await makeTag("tekrar-eden");

  assert.equal(
    res.status,
    409,
    "Etiket adı benzersizdir. Bunu şemadaki @unique garanti eder.",
  );
});

test("POST /tags boş isim → 400", async () => {
  const res = await post("/tags", { name: "  " });
  assert.equal(res.status, 400);
});

test("GET /tags → 200 ve dizi", async () => {
  await makeTag();
  const res = await get("/tags");

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body), "Yanıt bir dizi olmalı.");
});

test("POST /todos/:id/tags → 201 ve etiket bağlanır", async () => {
  const todo = await makeTodo();
  const tag = await makeTag();
  assert.equal(todo.status, 201);
  assert.equal(tag.status, 201, "Önce POST /tags çalışmalı.");

  const res = await post(`/todos/${todo.body.id}/tags`, { tagId: tag.body.id });

  assert.equal(res.status, 201);

  const liste = await get(`/todos/${todo.body.id}/tags`);
  assert.equal(liste.status, 200);
  assert.equal(liste.body.length, 1);
  assert.equal(liste.body[0].id, tag.body.id);
});

test("aynı etiketi ikinci kez bağlamak → 409", async () => {
  const todo = await makeTodo();
  const tag = await makeTag();

  await post(`/todos/${todo.body.id}/tags`, { tagId: tag.body.id });
  const res = await post(`/todos/${todo.body.id}/tags`, { tagId: tag.body.id });

  assert.equal(
    res.status,
    409,
    "Aynı çift iki kez eklenemez — bunu bağlantı tablosundaki bileşik PRIMARY KEY garanti eder.",
  );
});

test("bir todo birden çok etiket taşıyabilir, bir etiket birden çok todo'da olabilir", async () => {
  const todo1 = await makeTodo({ title: "birinci" });
  const todo2 = await makeTodo({ title: "ikinci" });
  const tagA = await makeTag();
  const tagB = await makeTag();

  await post(`/todos/${todo1.body.id}/tags`, { tagId: tagA.body.id });
  await post(`/todos/${todo1.body.id}/tags`, { tagId: tagB.body.id });
  await post(`/todos/${todo2.body.id}/tags`, { tagId: tagA.body.id });

  const birinci = await get(`/todos/${todo1.body.id}/tags`);
  const ikinci = await get(`/todos/${todo2.body.id}/tags`);

  assert.equal(birinci.body.length, 2, "İlk todo iki etiket taşımalı.");
  assert.equal(ikinci.body.length, 1, "İkinci todo bir etiket taşımalı.");
  assert.equal(
    ikinci.body[0].id,
    tagA.body.id,
    "Aynı etiket iki farklı todo'da bulunabilmeli — çoka-çok ilişkinin anlamı budur.",
  );
});

test("DELETE /todos/:id/tags/:tagId → 204 ve bağlantı kalkar", async () => {
  const todo = await makeTodo();
  const tag = await makeTag();
  await post(`/todos/${todo.body.id}/tags`, { tagId: tag.body.id });

  const res = await del(`/todos/${todo.body.id}/tags/${tag.body.id}`);

  assert.equal(res.status, 204);
  assert.equal(res.text, "", "204 yanıtının gövdesi boş olmalı.");

  const liste = await get(`/todos/${todo.body.id}/tags`);
  assert.equal(liste.body.length, 0);

  const etiketler = await get("/tags");
  assert.ok(
    etiketler.body.some((t) => t.id === tag.body.id),
    "Bağlantıyı silmek ETİKETİ silmez — yalnızca todo ile arasındaki ilişkiyi kaldırır.",
  );
});

test("olmayan todo veya etiket → 404", async () => {
  const todo = await makeTodo();
  const tag = await makeTag();

  const olmayanTodo = await post(`/todos/${OLMAYAN_ID}/tags`, {
    tagId: tag.body.id,
  });
  assert.equal(olmayanTodo.status, 404);

  const olmayanTag = await post(`/todos/${todo.body.id}/tags`, {
    tagId: OLMAYAN_ID,
  });
  assert.equal(olmayanTag.status, 404);

  const olmayanBaglanti = await del(
    `/todos/${todo.body.id}/tags/${tag.body.id}`,
  );
  assert.equal(
    olmayanBaglanti.status,
    404,
    "Var olmayan bir bağlantıyı silmek 404 dönmeli.",
  );
});

test("todo silinince etiket bağlantıları da silinir", async () => {
  const todo = await makeTodo();
  const tag = await makeTag();
  await post(`/todos/${todo.body.id}/tags`, { tagId: tag.body.id });

  const silme = await del(`/todos/${todo.body.id}`);
  assert.equal(silme.status, 204);

  const etiketler = await get("/tags");
  assert.ok(
    etiketler.body.some((t) => t.id === tag.body.id),
    "Etiketin kendisi durmalı — silinen yalnızca bağlantı satırıdır. " +
      "Bunu todo_tags üzerindeki ON DELETE CASCADE sağlar.",
  );
});
