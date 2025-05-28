"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3006),
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production")
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("Invalid environment variables!", _env.error.format());
  throw new Error("Invalid environment variables!");
}
var env = _env.data;

// src/database.ts
var config2 = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/routes/accountsRoutes.ts
var import_node_crypto = __toESM(require("crypto"));
var import_zod2 = require("zod");
async function userRoutes(app2) {
  app2.get("/accounts", async () => {
    const accounts = await knex("accounts").select("*");
    return { accounts };
  });
  app2.get("/accounts/:id", async (request) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const { id } = paramsSchema.parse(request.params);
    const account = await knex("accounts").where({ id });
    return { account };
  });
  app2.post("/accounts", async (request, reply) => {
    const bodySchema = import_zod2.z.object({
      name: import_zod2.z.string(),
      pass: import_zod2.z.string()
    });
    const { name, pass } = bodySchema.parse(request.body);
    try {
      await knex("accounts").insert({
        id: import_node_crypto.default.randomUUID(),
        name,
        pass,
        balance: 0
      });
    } catch {
      reply.status(403).send("Error creating account!");
    }
    reply.status(201).send("Account created!");
  });
  app2.patch("/accounts/:id", async (request, reply) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string()
    });
    const bodySchema = import_zod2.z.object({
      pass: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["debit", "credit"])
    });
    const { id } = paramsSchema.parse(request.params);
    const { pass, amount, type } = bodySchema.parse(request.body);
    try {
      const user = await knex("accounts").where({ id }).first();
      if (user?.pass === pass) {
        let balance = type === "credit" ? user.balance + amount : user.balance - amount;
        await knex("accounts").where({ pass }).update({ balance });
        await knex("transactions").insert({
          id: import_node_crypto.default.randomUUID(),
          account_id: id,
          amount,
          type
        });
        return reply.status(200).send("Account updated!");
      } else {
        return reply.status(404).send("Incorrect password!");
      }
    } catch {
      reply.status(404).send("Account not found!");
    }
  });
  app2.delete("/accounts", async (request, reply) => {
    const bodySchema = import_zod2.z.object({
      name: import_zod2.z.string(),
      pass: import_zod2.z.string()
    });
    const { name, pass } = bodySchema.parse(request.body);
    try {
      const account = await knex("accounts").where({ name, pass }).first();
      if (!account) {
        return reply.status(404).send("Account not found!");
      }
      await knex("transactions").where("account_id", account?.id).del();
      await knex("accounts").where({ name, pass }).first().del();
      return reply.status(200).send("Account deleted!");
    } catch (err) {
      return reply.status(404).send(err);
    }
  });
  app2.get("/transactions/:id", async (request) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string()
    });
    const { id } = paramsSchema.parse(request.params);
    const transactions = await knex("transactions").where("account_id", id);
    return { transactions };
  });
  app2.get("/transactions", async (request, reply) => {
    try {
      const transactions = await knex("transactions").select("*");
      return { transactions };
    } catch {
      return reply.status(404).send("Connection error");
    }
  });
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(userRoutes);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
