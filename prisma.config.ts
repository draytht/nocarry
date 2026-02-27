import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = async (connectionString: string) => {
  const { Pool } = await import("pg");
  return new Pool({ connectionString });
};

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL!,
  },
  migrate: {
    async adapter() {
      return new PrismaPg(await pool(process.env.DIRECT_URL!));
    },
  },
});