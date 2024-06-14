import { Page, Layout, Text, Card, Box, InlineStack } from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <Page>
      <TitleBar title="Smart Payment Hider" />
      <Layout.Section>
        <Card sectioned>
          <InlineStack spacing="tight">
            <Text as="p" variant="bodyLg">
              Smart Payment Hider is an innovative Shopify app designed to
              optimize your store's checkout experience by dynamically
              displaying payment methods based on the custom field values of
              products in the cart. Whether you want to offer specific payment
              options for certain product categories or hide methods for
              particular items, Smart Payment Hider provides the flexibility and
              control you need.
            </Text>
          </InlineStack>
          <Box padding="tight" />
          <InlineStack spacing="tight">
            <Text as="p" variant="bodyMd">
              To set it up, you need to create a new text-typed field called
              "custom.payment_name" for your products. Then, fill this field
              with the payment option name you wish to be active for this
              product. All other payment methods will be hidden.
            </Text>
          </InlineStack>
        </Card>
      </Layout.Section>
    </Page>
  );
}
