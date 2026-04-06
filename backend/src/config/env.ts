import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  jwtSecret: process.env.JWT_SECRET ?? "documind-dev-secret",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  useMockDb: (process.env.USE_MOCK_DB ?? "true").toLowerCase() !== "false",
  mysql: {
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "documind"
  }
};
