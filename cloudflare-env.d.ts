declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
declare namespace Cloudflare {
  interface Env {
    ENQUIRY_RECIPIENT?: string;
    REPORT_OWNER_EMAIL?: string;
    LOCAL_PORTFOLIO_PREVIEW?: string;
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    PORTFOLIO_DATABASE_TOKEN?: string;
    SITE_ORIGIN?: string;
  }
}
