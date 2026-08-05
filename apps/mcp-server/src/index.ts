import { env } from "./lib/env.js";

console.log("✅ Env loaded successfully");
console.log("PORT:", env.PORT);
console.log("NODE_ENV:", env.NODE_ENV);
console.log("Redis URL present:", !!env.UPSTASH_REDIS_REST_URL);
console.log("Vector URL present:", !!env.UPSTASH_VECTOR_REST_URL);