import { hcWithType } from "../src/client";
import { config } from "dotenv";
import { CreateApplicationInput } from "../src/validators/application-validator";

config({
  path: ".dev.vars",
});

const API_URL = process.env.PROD_API_URL;
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

async function main() {
  console.log(`Authenticating with ${API_URL}...`);

  // 1. Authenticate via Better-Auth to get session credentials
  const authRes = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://faisalownedjobtracker.pages.dev",
    },
    body: JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    }),
  });

  if (!authRes.ok) {
    throw new Error(
      `Authentication failed (${authRes.status}): ${await authRes.text()}`
    );
  }

  // Extract session token (from bearer plugin) or cookie
  const authData = (await authRes.json()) as { token?: string };
  const cookie = authRes.headers.get("set-cookie");

  // 2. Initialize Hono Client with Auth Header / Cookie
  const client = hcWithType(API_URL, {
    headers: {
      ...(authData.token ? { Authorization: `Bearer ${authData.token}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  // Define appliedDate and deadline
  const appliedDate = new Date();
  const deadline = new Date(appliedDate);
  deadline.setDate(deadline.getDate() + 7);

  // 3. Define sample data
  const sampleApplications: CreateApplicationInput[] = [
    {
      companyName: "Google",
      roleTitle: "Fullstack Engineer",
      status: "applied",
      salary: 25000000,
      workplaceType: "remote",
      jobType: "full_time",
      location: "Jakarta",
      appliedDate,
      deadline,
      jobUrl:
        "https://lokercirebon.com/lowongan-kerja-pt-linggarjati-jaya-abadi-cirebon/",
      notes: "This is a great job, wish I can secure it.",
      sourceCategory: "job_board",
      sourceName: "Loker Cirebon",
    },
    {
      companyName: "Apple",
      roleTitle: "Sales",
      status: "in_progress",
      currency: "Rp",
      salary: 18000000,
      workplaceType: "hybrid",
      jobType: "full_time",
      location: "Jakarta",
      appliedDate,
      deadline,
      jobUrl:
        "https://jobs.apple.com/en-us/details/200683436-1466/sales-technology-strategist-strategic-accounts-indonesia?team=SLDEV",
      notes: "This is a great job, wish I can secure it.",
      sourceCategory: "company_website",
      sourceName: "Apple's Career Page",
    },
    {
      companyName: "Stripe",
      roleTitle: "APAC Executive Marketing",
      status: "ghosted",
      currency: "USD",
      salary: 160000,
      workplaceType: "onsite",
      jobType: "full_time",
      location: "Singapore",
      appliedDate,
      deadline,
      jobUrl:
        "https://stripe.com/careers/listing/apac-executive-marketing/7764914",
      notes: "This is a great job, wish I can secure it.",
      sourceCategory: "company_website",
      sourceName: "Stripe's Career Page",
    },
  ];

  console.log(`Seeding ${sampleApplications.length} applications...`);

  // 4. Create applications through the type-safe client
  for (const app of sampleApplications) {
    const res = await client.applications.$post({
      json: app,
    });

    if (!res.ok) {
      console.error(
        `Failed to create application for ${app.companyName}:`,
        await res.text()
      );
      continue;
    }

    const created = await res.json();
    console.log(`Created application: ${created.companyName} (${created.id})`);
  }

  console.log("Seeding completed successfully!");
}

main().catch(console.error);
