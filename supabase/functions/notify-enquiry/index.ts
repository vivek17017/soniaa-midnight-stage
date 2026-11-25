type Enquiry = {
  id: string; name: string; email: string; intent: string; topic: string;
  message: string; attempted_at: number;
};
type Delivery = "pending" | "accepted" | "retry";
const intents: Record<string,string> = {
  project:"Project or partnership", hiring:"Hiring opportunity", event:"Event invitation", peer:"Professional exchange",
};
const topics: Record<string,string> = {
  direct:"General enquiry", brand:"Brand & messaging", demand:"Demand generation", leadership:"Team leadership",
};

function reply(body: object, status = 200) {
  return Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
}

async function send(enquiry: Enquiry, recipient: string): Promise<Delivery> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return "pending";
  const result = await fetch("https://api.resend.com/emails", {
    method:"POST", redirect:"manual", signal:AbortSignal.timeout(15000),
    headers:{
      "Content-Type":"application/json", "Authorization":"Bearer " + apiKey,
      "Idempotency-Key":"soniaa-enquiry-" + enquiry.id,
    },
    body:JSON.stringify({
      from:Deno.env.get("EMAIL_FROM") || "Soniaa Portfolio <onboarding@resend.dev>",
      to:[recipient], reply_to:enquiry.email,
      subject:"Soniaa portfolio · " + intents[enquiry.intent],
      text:[enquiry.name + " <" + enquiry.email + ">",intents[enquiry.intent],topics[enquiry.topic],enquiry.message].join("\n\n"),
    }),
  });
  if (!result.ok) {
    console.error("Resend rejected a notification", result.status);
    return "retry";
  }
  const confirmation = await result.json() as {id?:string};
  return confirmation.id ? "accepted" : "retry";
}

Deno.serve(async request => {
  if (request.method !== "POST") return reply({error:"POST required"},405);
  const token = request.headers.get("x-portfolio-key");
  if (!token || token.length < 32) return reply({error:"Server authentication required"},401);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({error:"JSON required"},415);
  const data = await request.json().catch(()=>null) as {id?:string;recipient?:string}|null;
  if (!data || typeof data.id!=="string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id)
      || typeof data.recipient!=="string" || data.recipient.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipient))
    return reply({error:"Invalid notification request"},400);

  const base = Deno.env.get("SUPABASE_URL");
  const publishable = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}").default || Deno.env.get("SUPABASE_ANON_KEY");
  if (!base || !publishable) return reply({error:"Storage unavailable"},503);
  const endpoint = new URL("/rest/v1/rpc/portfolio_request",base);
  const rpc = (operation:string,payload:object) => fetch(endpoint,{
    method:"POST",redirect:"manual",signal:AbortSignal.timeout(12000),
    headers:{"Content-Type":"application/json",apikey:publishable,"x-portfolio-key":token},
    body:JSON.stringify({operation,payload}),
  });
  try {
    // The database authenticates the server token before claiming an existing
    // enquiry. Message contents come only from the claimed, saved record.
    const claim = await rpc("claim",{id:data.id});
    if (claim.status===401 || claim.status===403) return reply({error:"Unauthorized"},401);
    if (!claim.ok) return reply({error:"Could not claim notification"},503);
    const enquiry = await claim.json() as Enquiry|null;
    if (!enquiry) return reply({status:"unchanged"});
    let status:Delivery = "retry";
    try { status = await send(enquiry,data.recipient); }
    catch { console.error("Resend connection failed"); }
    const finish = await rpc("finish",{id:enquiry.id,attempted_at:enquiry.attempted_at,status});
    if (!finish.ok) return reply({error:"Could not confirm notification status"},503);
    return reply({status});
  } catch {
    return reply({error:"Notification service temporarily unavailable"},503);
  }
});
