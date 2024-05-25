import { authenticate } from "../shopify.server";
import db from "../db.server";
import { json } from "@remix-run/node";
import crypto from "crypto";
//const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

export const action = async ({ request }) => {
  console.log("🚀 ~ action:");

  // Step 1: Clone the request and extract the raw payload
  const reqClone = request.clone();
  const rawPayload = await reqClone.text();
  console.log("🚀 ~ rawPayload:", rawPayload);

  // Step 2: Extract the HMAC signature from the request headers
  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");

  // Step 3: Compute the HMAC signature
  const generatedHash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(rawPayload, "utf8")
    .digest("base64");
  console.log(
    "🚀 ~ process.env.SHOPIFY_API_SECRET:",
    process.env.SHOPIFY_API_SECRET,
  );
  console.log("🚀 ~ generatedHash:", generatedHash);
  console.log("🚀 ~ hmacHeader:", hmacHeader);
  // Step 4: Compare the computed signature with the one provided by Shopify
  if (generatedHash !== hmacHeader) {
    console.log("HMAC validation failed");
    return new Response("Invalid HMAC signature", { status: 401 });
  }

  const { topic, shop, session, admin } = await authenticate.webhook(request);
  console.log("🚀 ~ topic, shop:", topic, shop);

  if (!admin) {
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      console.log(" case APP_UNINSTALLED");
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "PRODUCTS_UPDATE":
      console.log("Product was updated");
      break;
    case "CUSTOMERS_DATA_REQUEST":
      console.log("CUSTOMERS_DATA_REQUEST event");
      break;
    case "CUSTOMERS_REDACT":
      console.log("CUSTOMERS_REDACT event");
      break;
    case "SHOP_REDACT":
      console.log("SHOP_REDACT event");
      break;
    default:
      console.log("Unhandled Webhook Topic:", topic);
      break;
  }

  return json({ success: true });
};
