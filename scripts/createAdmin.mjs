// scripts/createAdmin.mjs
import { MongoClient } from "mongodb";
import { pbkdf2Sync, randomBytes } from "crypto";
import "dotenv/config";

const ADMIN_ID = "admin";
const ADMIN_PASS = "1234";

const ITER = 310000;
const KEYLEN = 32;
const DIGEST = "sha256";

async function main() {
  const MONGO_URL = process.env.MONGO_URL;
  if (!MONGO_URL) {
    console.error("MONGO_URL is missing. Check your .env");
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URL);
  await client.connect();

  try {
    // ✅ 여기서 adminCol 먼저 선언 (dboriginal에 저장)
    const adminCol = client.db("dboriginal").collection("adminId");

    // ✅ 권한 이슈 피하려고 index 생성은 일단 안 함
    // await adminCol.createIndex({ adminId: 1 }, { unique: true });

    const exists = await adminCol.findOne({ adminId: ADMIN_ID });
    if (exists) {
      console.log("Admin already exists:", ADMIN_ID);
      return;
    }

    const salt = randomBytes(16).toString("hex");
    const passHash = pbkdf2Sync(
      ADMIN_PASS,
      Buffer.from(salt, "hex"),
      ITER,
      KEYLEN,
      DIGEST
    ).toString("hex");

    await adminCol.insertOne({
      adminId: ADMIN_ID,
      passHash,
      salt,
      iter: ITER,
      digest: DIGEST,
      createdAt: new Date(),
    });

    console.log("Admin created:", ADMIN_ID);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
