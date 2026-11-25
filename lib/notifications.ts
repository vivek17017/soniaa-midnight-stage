const env = process.env;
export async function notifyEnquiry(id: string) {
  const {SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, PORTFOLIO_DATABASE_TOKEN, ENQUIRY_RECIPIENT} = env;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !PORTFOLIO_DATABASE_TOKEN || !ENQUIRY_RECIPIENT) {
    throw new Error("Email notification settings unavailable");
  }
  const response = await fetch(new URL("/functions/v1/notify-enquiry", SUPABASE_URL), {
    method: "POST", redirect: "manual", signal: AbortSignal.timeout(24000),
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "x-portfolio-key": PORTFOLIO_DATABASE_TOKEN,
    },
    body: JSON.stringify({id, recipient: ENQUIRY_RECIPIENT}),
  });
  if (!response.ok) throw new Error("Email notification request failed with status " + response.status);
}
