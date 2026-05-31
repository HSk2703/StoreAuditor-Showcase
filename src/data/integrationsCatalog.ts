// Static catalog of integrations Kairo can connect to.
// This is intentionally NOT sourced from Composio's session.tools() — that endpoint
// is for execution-time tool discovery, not UI listing. Using a static catalog
// keeps the UI fast, predictable, and resilient to upstream API failures.
//
// Add tools here as Kairo gains support for them. The `connectable` flag controls
// whether the "Connect" button is enabled (vs. "Coming Soon").

export interface CatalogTool {
  id: string;          // matches user_integrations.provider
  name: string;
  category: CategoryId;
  domain: string;      // used to derive favicon when no explicit logo
  logo?: string;       // optional explicit logo URL (svg/png)
  description: string;
  aiPowered?: boolean;
  connectable?: boolean; // default true
  popular?: boolean;     // surfaces on the Hub "Available Tools" section
}

export type CategoryId =
  | "ecommerce"
  | "analytics"
  | "advertising"
  | "email"
  | "ai"
  | "design"
  | "automation"
  | "crm"
  | "payments"
  | "seo"
  | "communication"
  | "productivity"
  | "support"
  | "data"
  | "other";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "ecommerce", label: "Ecommerce" },
  { id: "analytics", label: "Analytics" },
  { id: "advertising", label: "Advertising" },
  { id: "email", label: "Email & SMS" },
  { id: "ai", label: "AI Tools" },
  { id: "design", label: "Design" },
  { id: "automation", label: "Automation" },
  { id: "crm", label: "CRM & Sales" },
  { id: "payments", label: "Payments" },
  { id: "seo", label: "SEO" },
  { id: "communication", label: "Communication" },
  { id: "productivity", label: "Productivity" },
  { id: "support", label: "Support" },
  { id: "data", label: "Data" },
];

export function logoFor(t: CatalogTool): string {
  if (t.logo) return t.logo;
  return `https://www.google.com/s2/favicons?domain=${t.domain}&sz=64`;
}

export const integrationsCatalog: CatalogTool[] = [
  // Ecommerce
  { id: "shopify", name: "Shopify", category: "ecommerce", domain: "shopify.com", description: "Manage products, orders, and store data", popular: true },
  { id: "woocommerce", name: "WooCommerce", category: "ecommerce", domain: "woocommerce.com", description: "WordPress ecommerce platform" },
  { id: "bigcommerce", name: "BigCommerce", category: "ecommerce", domain: "bigcommerce.com", description: "Enterprise ecommerce platform" },
  { id: "magento", name: "Magento", category: "ecommerce", domain: "magento.com", description: "Adobe Commerce platform" },
  { id: "etsy", name: "Etsy", category: "ecommerce", domain: "etsy.com", description: "Marketplace for handmade goods" },
  { id: "amazon_seller", name: "Amazon Seller", category: "ecommerce", domain: "sellercentral.amazon.com", description: "Amazon marketplace seller data" },
  { id: "ebay", name: "eBay", category: "ecommerce", domain: "ebay.com", description: "Global online marketplace" },
  { id: "replo", name: "Replo", category: "ecommerce", domain: "replo.app", description: "AI-powered Shopify landing page builder", aiPowered: true },
  { id: "recharge", name: "Recharge", category: "ecommerce", domain: "rechargepayments.com", description: "Subscription billing for ecommerce" },

  // Analytics
  { id: "google_analytics", name: "Google Analytics", category: "analytics", domain: "analytics.google.com", description: "Website traffic and behavior analytics", popular: true },
  { id: "mixpanel", name: "Mixpanel", category: "analytics", domain: "mixpanel.com", description: "Product analytics and user journey tracking", popular: true },
  { id: "amplitude", name: "Amplitude", category: "analytics", domain: "amplitude.com", description: "AI-powered product analytics", aiPowered: true },
  { id: "posthog", name: "PostHog", category: "analytics", domain: "posthog.com", description: "Open-source product analytics", aiPowered: true, popular: true },
  { id: "hotjar", name: "Hotjar", category: "analytics", domain: "hotjar.com", description: "Heatmaps and session recordings", aiPowered: true },
  { id: "fullstory", name: "Fullstory", category: "analytics", domain: "fullstory.com", description: "Digital experience intelligence" },
  { id: "heap", name: "Heap", category: "analytics", domain: "heap.io", description: "Auto-capture product analytics" },
  { id: "plausible", name: "Plausible", category: "analytics", domain: "plausible.io", description: "Privacy-first web analytics" },
  { id: "fathom", name: "Fathom", category: "analytics", domain: "usefathom.com", description: "Simple, privacy-first analytics" },
  { id: "clarity", name: "Microsoft Clarity", category: "analytics", domain: "clarity.microsoft.com", description: "Free heatmaps and recordings" },

  // Advertising
  { id: "google_ads", name: "Google Ads", category: "advertising", domain: "ads.google.com", description: "Search and display ad performance", popular: true },
  { id: "meta_ads", name: "Meta Ads", category: "advertising", domain: "facebook.com", description: "Facebook and Instagram ad tracking", popular: true },
  { id: "tiktok_ads", name: "TikTok Ads", category: "advertising", domain: "tiktok.com", description: "TikTok ad campaign tracking", popular: true },
  { id: "linkedin_ads", name: "LinkedIn Ads", category: "advertising", domain: "linkedin.com", description: "B2B paid advertising" },
  { id: "pinterest_ads", name: "Pinterest Ads", category: "advertising", domain: "pinterest.com", description: "Pinterest ad campaigns" },
  { id: "snapchat_ads", name: "Snapchat Ads", category: "advertising", domain: "snapchat.com", description: "Snap ads and campaigns" },
  { id: "reddit_ads", name: "Reddit Ads", category: "advertising", domain: "reddit.com", description: "Reddit promoted posts" },
  { id: "x_ads", name: "X Ads", category: "advertising", domain: "x.com", description: "X (Twitter) advertising" },

  // Email & SMS
  { id: "klaviyo", name: "Klaviyo", category: "email", domain: "klaviyo.com", description: "AI-powered email and SMS marketing", aiPowered: true, popular: true },
  { id: "mailchimp", name: "Mailchimp", category: "email", domain: "mailchimp.com", description: "Email marketing and automation", popular: true },
  { id: "omnisend", name: "Omnisend", category: "email", domain: "omnisend.com", description: "Ecommerce email and SMS automation" },
  { id: "resend", name: "Resend", category: "email", domain: "resend.com", description: "Modern email API for developers" },
  { id: "sendgrid", name: "SendGrid", category: "email", domain: "sendgrid.com", description: "Transactional email service" },
  { id: "postmark", name: "Postmark", category: "email", domain: "postmarkapp.com", description: "Transactional email delivery" },
  { id: "convertkit", name: "ConvertKit", category: "email", domain: "convertkit.com", description: "Creator-focused email marketing" },
  { id: "attentive", name: "Attentive", category: "email", domain: "attentivemobile.com", description: "SMS marketing platform" },
  { id: "postscript", name: "Postscript", category: "email", domain: "postscript.io", description: "SMS for Shopify brands" },

  // AI Tools
  { id: "openai", name: "OpenAI", category: "ai", domain: "openai.com", description: "GPT models and APIs", aiPowered: true, popular: true },
  { id: "anthropic", name: "Anthropic", category: "ai", domain: "anthropic.com", description: "Claude AI models", aiPowered: true },
  { id: "perplexity", name: "Perplexity", category: "ai", domain: "perplexity.ai", description: "AI-powered research and answers", aiPowered: true },
  { id: "elevenlabs", name: "ElevenLabs", category: "ai", domain: "elevenlabs.io", description: "AI voice generation", aiPowered: true },
  { id: "firecrawl", name: "Firecrawl", category: "ai", domain: "firecrawl.dev", description: "AI-powered web scraping", aiPowered: true },
  { id: "jasper", name: "Jasper AI", category: "ai", domain: "jasper.ai", description: "AI marketing copy and content", aiPowered: true },
  { id: "midjourney", name: "Midjourney", category: "ai", domain: "midjourney.com", description: "AI image generation", aiPowered: true, connectable: false },
  { id: "runway", name: "Runway", category: "ai", domain: "runwayml.com", description: "AI video generation", aiPowered: true, connectable: false },
  { id: "heygen", name: "HeyGen", category: "ai", domain: "heygen.com", description: "AI avatars and video", aiPowered: true },

  // Design
  { id: "canva", name: "Canva", category: "design", domain: "canva.com", description: "AI-powered design suite", aiPowered: true, popular: true },
  { id: "figma", name: "Figma", category: "design", domain: "figma.com", description: "Collaborative UI/UX design" },
  { id: "jitter", name: "Jitter", category: "design", domain: "jitter.video", description: "Motion design and animation" },
  { id: "adobe_express", name: "Adobe Express", category: "design", domain: "adobe.com", description: "Quick-create design tool" },
  { id: "framer", name: "Framer", category: "design", domain: "framer.com", description: "Visual website builder" },
  { id: "webflow", name: "Webflow", category: "design", domain: "webflow.com", description: "No-code website platform" },

  // Automation
  { id: "zapier", name: "Zapier", category: "automation", domain: "zapier.com", description: "Workflow automation across 7,000+ apps", popular: true },
  { id: "make", name: "Make", category: "automation", domain: "make.com", description: "Visual workflow automation" },
  { id: "n8n", name: "n8n", category: "automation", domain: "n8n.io", description: "Open-source workflow automation", aiPowered: true },
  { id: "inngest", name: "Inngest", category: "automation", domain: "inngest.com", description: "Event-driven background jobs" },
  { id: "workato", name: "Workato", category: "automation", domain: "workato.com", description: "Enterprise integration platform" },
  { id: "tray", name: "Tray.io", category: "automation", domain: "tray.io", description: "Low-code automation platform" },

  // CRM & Sales
  { id: "hubspot", name: "HubSpot", category: "crm", domain: "hubspot.com", description: "CRM, marketing, and sales platform", popular: true },
  { id: "salesforce", name: "Salesforce", category: "crm", domain: "salesforce.com", description: "Enterprise CRM" },
  { id: "pipedrive", name: "Pipedrive", category: "crm", domain: "pipedrive.com", description: "Sales pipeline CRM" },
  { id: "attio", name: "Attio", category: "crm", domain: "attio.com", description: "Modern relational CRM" },
  { id: "close", name: "Close", category: "crm", domain: "close.com", description: "Inside sales CRM" },
  { id: "copper", name: "Copper", category: "crm", domain: "copper.com", description: "CRM for Google Workspace" },
  { id: "ashby", name: "Ashby", category: "crm", domain: "ashbyhq.com", description: "Recruiting and ATS" },

  // Payments
  { id: "stripe", name: "Stripe", category: "payments", domain: "stripe.com", description: "Payment processing", popular: true },
  { id: "paddle", name: "Paddle", category: "payments", domain: "paddle.com", description: "Merchant of record for SaaS" },
  { id: "polar", name: "Polar", category: "payments", domain: "polar.sh", description: "Subscription billing for creators" },
  { id: "lemonsqueezy", name: "Lemon Squeezy", category: "payments", domain: "lemonsqueezy.com", description: "Digital product payments" },
  { id: "paypal", name: "PayPal", category: "payments", domain: "paypal.com", description: "Online payments" },
  { id: "square", name: "Square", category: "payments", domain: "squareup.com", description: "POS and online payments" },

  // SEO
  { id: "google_search_console", name: "Search Console", category: "seo", domain: "search.google.com", description: "Google SEO performance" },
  { id: "semrush", name: "Semrush", category: "seo", domain: "semrush.com", description: "SEO and competitive research", aiPowered: true },
  { id: "ahrefs", name: "Ahrefs", category: "seo", domain: "ahrefs.com", description: "Backlinks and SEO research", aiPowered: true, connectable: false },
  { id: "surfer_seo", name: "Surfer SEO", category: "seo", domain: "surferseo.com", description: "AI-driven content optimization", aiPowered: true },
  { id: "moz", name: "Moz", category: "seo", domain: "moz.com", description: "SEO research and tracking" },
  { id: "screaming_frog", name: "Screaming Frog", category: "seo", domain: "screamingfrog.co.uk", description: "Technical SEO crawler" },

  // Communication
  { id: "slack", name: "Slack", category: "communication", domain: "slack.com", description: "Team messaging and notifications", popular: true },
  { id: "discord", name: "Discord", category: "communication", domain: "discord.com", description: "Community chat and voice" },
  { id: "telegram", name: "Telegram", category: "communication", domain: "telegram.org", description: "Bot-powered alerts" },
  { id: "microsoft_teams", name: "Microsoft Teams", category: "communication", domain: "teams.microsoft.com", description: "Enterprise team chat" },
  { id: "twilio", name: "Twilio", category: "communication", domain: "twilio.com", description: "SMS, voice, and messaging" },
  { id: "whatsapp_business", name: "WhatsApp Business", category: "communication", domain: "whatsapp.com", description: "Business messaging API" },

  // Productivity
  { id: "notion", name: "Notion", category: "productivity", domain: "notion.so", description: "Connected workspace and docs", popular: true },
  { id: "linear", name: "Linear", category: "productivity", domain: "linear.app", description: "Modern issue tracking" },
  { id: "asana", name: "Asana", category: "productivity", domain: "asana.com", description: "Work and project management" },
  { id: "trello", name: "Trello", category: "productivity", domain: "trello.com", description: "Kanban project boards" },
  { id: "airtable", name: "Airtable", category: "productivity", domain: "airtable.com", description: "Spreadsheet-database hybrid" },
  { id: "google_sheets", name: "Google Sheets", category: "productivity", domain: "sheets.google.com", description: "Cloud spreadsheets" },
  { id: "google_drive", name: "Google Drive", category: "productivity", domain: "drive.google.com", description: "Cloud file storage" },
  { id: "google_docs", name: "Google Docs", category: "productivity", domain: "docs.google.com", description: "Cloud documents" },
  { id: "google_calendar", name: "Google Calendar", category: "productivity", domain: "calendar.google.com", description: "Calendar and scheduling" },
  { id: "gmail", name: "Gmail", category: "productivity", domain: "gmail.com", description: "Email by Google" },
  { id: "microsoft_excel", name: "Microsoft Excel", category: "productivity", domain: "office.com", description: "Spreadsheets" },
  { id: "microsoft_word", name: "Microsoft Word", category: "productivity", domain: "office.com", description: "Documents" },
  { id: "fireflies", name: "Fireflies", category: "productivity", domain: "fireflies.ai", description: "AI meeting transcription", aiPowered: true },
  { id: "granola", name: "Granola", category: "productivity", domain: "granola.ai", description: "AI meeting notes", aiPowered: true },

  // Support
  { id: "intercom", name: "Intercom", category: "support", domain: "intercom.com", description: "Customer messaging platform" },
  { id: "zendesk", name: "Zendesk", category: "support", domain: "zendesk.com", description: "Customer service software" },
  { id: "gorgias", name: "Gorgias", category: "support", domain: "gorgias.com", description: "Ecommerce helpdesk", aiPowered: true },
  { id: "freshdesk", name: "Freshdesk", category: "support", domain: "freshdesk.com", description: "Cloud-based support" },
  { id: "crisp", name: "Crisp", category: "support", domain: "crisp.chat", description: "Multichannel customer support" },
  { id: "front", name: "Front", category: "support", domain: "front.com", description: "Shared inbox for teams" },

  // Data
  { id: "snowflake", name: "Snowflake", category: "data", domain: "snowflake.com", description: "Cloud data platform" },
  { id: "bigquery", name: "BigQuery", category: "data", domain: "cloud.google.com", description: "Serverless data warehouse" },
  { id: "databricks", name: "Databricks", category: "data", domain: "databricks.com", description: "Unified analytics and AI" },
  { id: "supabase", name: "Supabase", category: "data", domain: "supabase.com", description: "Open-source backend" },
  { id: "aws_s3", name: "AWS S3", category: "data", domain: "aws.amazon.com", description: "Cloud object storage" },
];

export const TOTAL_TOOLS = integrationsCatalog.length;

// We claim "1,000+ tools Kairo can connect to" because Kairo can route
// execution through Composio's universal toolkit. The static catalog is
// the curated subset surfaced in the UI.
export const ECOSYSTEM_REACH = 1000;
