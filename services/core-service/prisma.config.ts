import path from "node:path";
import {config} from "dotenv";
import {defineConfig} from "prisma/config";

const rootEnvPath =
    process.env.GREENLY_ROOT_ENV ?? path.resolve(process.cwd(), "../../.env");

config({
    path: rootEnvPath,
    override: false,
});

if (!process.env.DATABASE_URL) {
    throw new Error(
        `DATABASE_URL is not defined. Expected root env at: ${rootEnvPath}`
    );
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx ./prisma/seed.ts",
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
