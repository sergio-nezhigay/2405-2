import crypto from "crypto";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  console.log("Webhook request received");
  try {
    const rawBody = await request.text(); // Get the raw request body
    const payload = JSON.parse(rawBody); // Parse the JSON payload

    const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
    const secret = process.env.SHOPIFY_API_SECRET; // Replace with your actual client secret

    // Generate the HMAC signature using the raw request body
    const generatedHmac = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");

    // Timing-safe compare function
    const secureCompare = (a, b) => {
      if (a.length !== b.length) {
        return false;
      }
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return result === 0;
    };

    if (!secureCompare(generatedHmac, hmacHeader)) {
      return json({ message: "Signature mismatch" }, { status: 401 });
    }

    // Process the webhook payload
    const topic = request.headers.get("X-Shopify-Topic");

    switch (topic) {
      case "APP_UNINSTALLED":
        console.log("case APP_UNINSTALLED");
        if (session) {
          await db.session.deleteMany({ where: { shop } });
        }
        break;
      case "PRODUCTS_UPDATE":
      case "products/update":
        console.log("case ====> dsdsd PRODUCTS_UPDATE");
        break;
      case "CUSTOMERS_DATA_REQUEST":
      case "CUSTOMERS_REDACT":
      case "SHOP_REDACT":
      default:
        console.log("Unhandled Webhook Topic:", topic);
    }

  } catch (error) {
    console.log("Error while processing custom webhook", error);
    return new Response("Error", { status: 500 });
  }

  return new Response("Success", { status: 200 });
};
