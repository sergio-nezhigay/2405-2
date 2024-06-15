import crypto from "crypto";
import { Buffer } from "buffer";

export const action = async ({ request }) => {
  console.log("Webhook request received");
  try {
    const requestBody = await request.json();
    const req = JSON.parse(requestBody.body);

    const metadata = req.detail.metadata;
    const payload = req.detail.payload;

    const hmac = metadata["X-Shopify-Hmac-SHA256"];

    // Converting JSON to string
    const jsonString = JSON.stringify(payload);

    // Creating a buffer from the JSON string
    const buffer = Buffer.from(jsonString);

    const genHash = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
      .update(buffer, "utf8", "hex")
      .digest("base64");

    if (genHash !== hmac) {
      // return new Response("Couldn't verify incoming Webhook request!", {
      //   status: 401,
      // });
    }

    if (metadata["X-Shopify-Shop-Domain"]) {
      try {
        const shopData = await db.session.deleteMany({
          where: {
            shop: metadata["X-Shopify-Shop-Domain"],
          },
          select: {
            access_token: true,
          },
        });

        let topic;
        if (metadata["X-Shopify-Topic"] === "shop/update") {
          topic = "SHOP_UPDATE";
        } else if (metadata["X-Shopify-Topic"] === "products/create") {
          topic = "PRODUCTS_CREATE";
        } else if (metadata["X-Shopify-Topic"] === "products/update") {
          topic = "PRODUCTS_UPDATE";
        } else if (metadata["X-Shopify-Topic"] === "products/delete") {
          topic = "PRODUCTS_DELETE";
        }

        
      } catch (error) {
        console.log("Error while getting shop data in custom webhook", error);
      }
    }
  } catch (error) {
    console.log("Error while processing custom webhook", error);
  }

  return new Response("Success", { status: 200 });
};
