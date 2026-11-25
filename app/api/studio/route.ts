import { getChatGPTUser } from "@/app/chatgpt-auth";
import { portfolioRequest, isOwner, isId, json, readBody } from "@/lib/server-data";
import { notifyEnquiry } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!isOwner(await getChatGPTUser())) return json({error:"Sign in with the account assigned to this private report."},403);
  try {
    return json(await portfolioRequest("report"));
  } catch {return json({error:"The report is temporarily unavailable. Please refresh."},503);}
}
export async function POST(request: Request) {
  if (!isOwner(await getChatGPTUser())) return json({error:"Owner access required."},403);
  const data=await readBody(request);
  if (!data || !isId(data.id)) return json({error:"Invalid enquiry."},400);
  try {
    await notifyEnquiry(data.id);
    return json({ok:true});
  } catch {return json({error:"The notification could not be retried."},503);}
}
