export interface PolicySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface PolicyDocument {
  path: string;
  title: string;
  summary: string;
  sections: PolicySection[];
}

const contact = 'lahabfire@gmail.com';

export const policyDocuments: PolicyDocument[] = [
  {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    summary: 'How LAHAB collects, uses, protects, and retains information when you browse, contact us, or place an order.',
    sections: [
      { title: 'Information we collect', bullets: ['Contact, delivery, sizing, and order details you provide.', 'Messages, review content, and images you choose to submit.', 'A random device identifier used to maintain your cart and saved pieces.', 'Basic technical and security information required to operate the website.'] },
      { title: 'How we use information', bullets: ['Fulfil and support orders.', 'Respond to atelier inquiries and stock alerts.', 'Maintain carts, wishlists, reviews, fraud prevention, and site security.', 'Send marketing only where you have requested it or consented.'] },
      { title: 'Sharing and retention', paragraphs: ['We share only what is necessary with service providers such as hosting, delivery, and email providers. We do not sell personal information. Records are retained only as long as reasonably required for orders, support, security, and legal obligations.'] },
      { title: 'Your choices', paragraphs: [`You may ask to access, correct, or delete eligible personal information by contacting ${contact}. Statutory rights remain unaffected.`] },
    ],
  },
  {
    path: '/terms',
    title: 'Terms & Conditions',
    summary: 'The terms governing use of the LAHAB digital flagship and purchases from the atelier.',
    sections: [
      { title: 'Using the site', paragraphs: ['You must provide accurate information and use the site lawfully. Product imagery, typography, artwork, garment designs, and LAHAB marks may not be copied or commercially reused without permission.'] },
      { title: 'Orders', paragraphs: ['Submitting an order is a request to purchase. An order is accepted when LAHAB confirms it. Availability, verification, delivery coverage, or an obvious pricing error may require cancellation and a prompt notice.'] },
      { title: 'Products and care', paragraphs: ['Small differences in color, texture, embroidery, and screen presentation can occur. Follow the care instructions supplied with each garment.'] },
      { title: 'Liability and governing rights', paragraphs: ['Nothing in these terms excludes rights or remedies that cannot legally be excluded. These terms are interpreted under applicable Egyptian law, without limiting mandatory consumer protections.'] },
    ],
  },
  {
    path: '/cookie-policy',
    title: 'Cookie Policy',
    summary: 'A transparent record of the browser storage used by LAHAB.',
    sections: [
      { title: 'Strictly necessary storage', bullets: ['lahab_device_id: keeps cart and wishlist records associated with your browser.', 'lahab_admin_token: authenticates authorized administrators only.', 'Theme, order history, and consent preferences may be stored locally in your browser.'] },
      { title: 'Optional categories', paragraphs: ['Analytics and marketing categories are disabled unless you choose to allow them. The current storefront does not activate third-party advertising trackers.'] },
      { title: 'Control', paragraphs: ['Use Cookie Preferences at any time to update optional consent. Blocking necessary storage may prevent cart, wishlist, order-history, or administrator functionality.'] },
    ],
  },
  {
    path: '/shipping-policy',
    title: 'Shipping Policy',
    summary: 'Dispatch, delivery estimates, inspection, and shipment support.',
    sections: [
      { title: 'Dispatch and delivery', paragraphs: ['Available delivery destinations, charges, and estimates are shown during checkout or confirmed by the atelier. Estimates begin after order confirmation and may change because of courier, customs, address, or force-majeure delays.'] },
      { title: 'Inspection and tracking', paragraphs: ['Where the courier supports it, you may inspect the parcel before acceptance. Keep your order code available when requesting tracking assistance.'] },
      { title: 'Address issues', paragraphs: [`Contact ${contact} promptly if an address is incorrect. Once dispatched, rerouting may not be possible and additional courier charges may apply.`] },
    ],
  },
  {
    path: '/returns-refunds',
    title: 'Return & Refund Policy',
    summary: 'Eligibility and the process for exchanges, returns, defects, and refunds.',
    sections: [
      { title: 'Change-of-mind requests', paragraphs: ['Contact LAHAB within 14 days of receipt. The piece must be unworn, unwashed, unaltered, and returned with its security tags and original packaging intact. Personalized or monogrammed pieces may not be eligible unless defective.'] },
      { title: 'Defective or incorrect pieces', paragraphs: ['Contact us immediately with the order code and clear photographs. Eligible defective or incorrectly supplied goods will be handled in accordance with applicable consumer law.'] },
      { title: 'Refunds', paragraphs: ['Approved refunds are returned through the original payment method where possible. Timing depends on inspection and the payment provider. Mandatory consumer rights are not reduced by this policy.'] },
      { title: 'Start a request', paragraphs: [`Email ${contact} or use the Contact Us page with your order code, reason, and supporting photographs.`] },
    ],
  },
  {
    path: '/payment-policy',
    title: 'Payment Policy',
    summary: 'How payment options, totals, verification, and payment safety work.',
    sections: [
      { title: 'Available methods', paragraphs: ['The methods available for your order are displayed at checkout and may include cash on delivery or a confirmed electronic transfer. Do not send payment to details received from unofficial accounts.'] },
      { title: 'Pricing and totals', paragraphs: ['Prices are displayed in the selected currency for convenience. The final confirmed order total includes applicable product, customization, and delivery charges shown before confirmation.'] },
      { title: 'Payment safety', bullets: ['LAHAB will never ask for your password, PIN, or one-time verification code.', 'Keep the order code and payment proof until fulfilment.', `Report suspicious payment instructions to ${contact}.`] },
    ],
  },
];

export const policyByPath = new Map(policyDocuments.map((document) => [document.path, document]));
