// Runs the exported portfolio against a PostgreSQL database on this computer.
// The hosted application, including its form validation, uses the same RPC and SQL.
import http from "node:http";
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";

const root = fileURLToPath(new URL("../", import.meta.url));
const state = resolve(root, ".local-preview", "postgres");
const migrations = resolve(root, "supabase", "migrations");
const token = randomBytes(32).toString("hex");
const apiKey = "local-preview";
const apiPort = 5174;

let database;
let child;
let stopping = false;

async function initializeDatabase() {
  await mkdir(state, {recursive:true});
  database = new PGlite(state);
  await database.waitReady;
  await database.exec(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
    END $$;
    CREATE TABLE IF NOT EXISTS public.local_preview_migrations (name text PRIMARY KEY);
  `);
  const applied = new Set((await database.query("SELECT name FROM public.local_preview_migrations")).rows.map(row => row.name));
  for (const name of (await readdir(migrations)).filter(file => file.endsWith(".sql")).sort()) {
    if (applied.has(name)) continue;
    const sql = await readFile(join(migrations,name), "utf8");
    await database.transaction(async tx => {
      await tx.exec(sql);
      await tx.query("INSERT INTO public.local_preview_migrations(name) VALUES ($1)",[name]);
    });
  }
  await database.query(`INSERT INTO portfolio.server_credentials(slot,token_digest)
    VALUES ('portfolio',sha256(convert_to($1::text,'UTF8')))
    ON CONFLICT (slot) DO UPDATE SET token_digest=excluded.token_digest`,[token]);
}

function send(res, status, data) {
  res.writeHead(status, {"Content-Type":"application/json","Cache-Control":"no-store"});
  res.end(JSON.stringify(data));
}
async function handle(req,res) {
  if (req.method !== "POST" || req.headers["x-portfolio-key"] !== token || req.headers.apikey !== apiKey) {
    return send(res,403,{error:"Local application access required"});
  }
  if (req.url === "/functions/v1/notify-enquiry") return send(res,200,{status:"pending"});
  if (req.url !== "/rest/v1/rpc/portfolio_request") return send(res,404,{error:"Unknown route"});

  const chunks=[];
  let size=0;
  for await (const chunk of req) {
    size+=chunk.length;
    if (size>32000) return send(res,413,{error:"Request too large"});
    chunks.push(chunk);
  }
  const {operation,payload} = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const result = await database.transaction(async tx => {
    await tx.query("SELECT set_config('request.headers',$1,true)",[JSON.stringify({"x-portfolio-key":token})]);
    await tx.exec("SET LOCAL ROLE anon");
    return tx.query("SELECT public.portfolio_request($1::text,$2::jsonb) AS result",[operation,JSON.stringify(payload??{})]);
  });
  send(res,200,result.rows[0].result);
}
const api=http.createServer((req,res)=>{
  handle(req,res).catch(error=>{
    console.error("Local database request failed:",error.message);
    if (!res.headersSent) send(res,500,{error:"Local database request failed"});
  });
});

async function stop(code=0) {
  if (stopping) return;
  stopping=true;
  if (child && child.exitCode===null) child.kill();
  api.close();
  await database?.close();
  process.exit(code);
}
process.on("SIGINT",()=>void stop());
process.on("SIGTERM",()=>void stop());

try {
  // Reserve the loopback port before opening the data directory. A second
  // launcher cannot open an already running preview's database.
  await new Promise((accept,reject)=>{
    api.once("error",reject);
    api.listen(apiPort,"127.0.0.1",accept);
  });
  await initializeDatabase();
  console.log("Portfolio  http://127.0.0.1:5173");
  console.log("Private report  http://127.0.0.1:5173/studio");
  console.log("Enquiries stay on this computer. Press Ctrl+C to stop.");
  child=spawn(process.execPath,["scripts/run-framework.mjs","dev","--hostname","127.0.0.1"],{
    cwd:root,stdio:"inherit",env:{...process.env,
      SONIAA_LOCAL_API:"http://127.0.0.1:"+apiPort,
      SONIAA_LOCAL_KEY:apiKey, SONIAA_LOCAL_TOKEN:token,
    },
  });
  child.on("error",error=>{ console.error(error.message);void stop(1); });
  child.on("exit",code=>void stop(code??0));
} catch(error) {
  console.error(error.code==="EADDRINUSE"?"The local portfolio is already running or port 5174 is in use.":error.message);
  await stop(1);
}
