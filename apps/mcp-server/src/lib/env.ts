import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const EnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  UPSTASH_VECTOR_REST_URL: z.string().url(),
  UPSTASH_VECTOR_REST_TOKEN: z.string().min(1),
  PORT: z
    .string()
    .default("3001")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;