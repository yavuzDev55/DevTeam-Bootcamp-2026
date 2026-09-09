// Aşama 3 — bire-bir ilişki: kullanıcı ve profili
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { get, put, makeUser, stop, OLMAYAN_ID } from "./helper.js";

after(stop);

test("PUT /users/:id/profile → 200 ve profil döner", async () => {
  const user = await makeUser();
  assert.equal(user.status, 201, "Önce kullanıcı oluşturulabilmeli.");

  const res = await put(`/users/${user.body.id}/profile`, {
    bio: "İTÜ ACM DevTeam",
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.bio, "İTÜ ACM DevTeam");
  assert.equal(
    res.body.userId,
    user.body.id,
    "Profil, ait olduğu kullanıcıyı göstermeli.",
  );
});

test("GET /users/:id/profile → 200 ve kaydedilen profil", async () => {
  const user = await makeUser();
  await put(`/users/${user.body.id}/profile`, { bio: "backend" });

  const res = await get(`/users/${user.body.id}/profile`);

  assert.equal(res.status, 200);
  assert.equal(res.body.bio, "backend");
});

test("PUT ikinci kez → yeni profil OLUŞTURMAZ, mevcudu günceller", async () => {
  const user = await makeUser();

  const ilk = await put(`/users/${user.body.id}/profile`, { bio: "ilk hâli" });
  assert.equal(ilk.status, 200);

  const ikinci = await put(`/users/${user.body.id}/profile`, {
    bio: "güncellenmiş hâli",
  });

  assert.equal(ikinci.status, 200);
  assert.equal(ikinci.body.bio, "güncellenmiş hâli");
  assert.equal(
    ikinci.body.id,
    ilk.body.id,
    "Bire-bir ilişkide ikinci bir profil satırı oluşamaz — aynı kaydın id'si dönmeli. " +
      "Bunu user_id üzerindeki UNIQUE kısıtı garanti eder.",
  );
});

test("GET /users/:id/profile — profili olmayan kullanıcı → 404", async () => {
  const user = await makeUser();

  const res = await get(`/users/${user.body.id}/profile`);

  assert.equal(
    res.status,
    404,
    "Kullanıcı var ama profili yoksa 404 dönmeli — boş nesne değil.",
  );
});

test("olmayan kullanıcı → 404", async () => {
  const okuma = await get(`/users/${OLMAYAN_ID}/profile`);
  assert.equal(okuma.status, 404);

  const yazma = await put(`/users/${OLMAYAN_ID}/profile`, { bio: "hayalet" });
  assert.equal(
    yazma.status,
    404,
    "Olmayan bir kullanıcıya profil yazılamamalı.",
  );
});

test("PUT /users/:id/profile boş bio ile → 400", async () => {
  const user = await makeUser();

  const res = await put(`/users/${user.body.id}/profile`, { bio: "   " });

  assert.equal(res.status, 400);
});
