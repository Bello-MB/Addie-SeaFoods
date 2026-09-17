# Addie & Lobsters — Static Seafood Ordering Website

A mobile-friendly static seafood storefront branded for **Addie & Lobsters** using the supplied logo and its black/gold/red/white/blue colour palette.

## Features

- Seafood menu with quantity +/− controls
- Live cart total
- Checkout form
- Paystack inline checkout
- WhatsApp order communication
- Responsive mobile and desktop layout
- No database required for the frontend

## Files

```text
seafood-static/
├── index.html
├── style.css
├── script.js
└── assets/
    └── addie-lobsters-logo.jpg
```

## Configure WhatsApp

Open `script.js` and replace:

```js
whatsappNumber: '2348012345678'
```

with the business WhatsApp number in international format, without `+` or spaces.

## Configure Paystack

Replace the demo public key in `script.js`:

```js
paystackPublicKey: 'pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY'
```

Use a **Paystack PUBLIC key only** in this static website. Never place a Paystack secret key in frontend JavaScript.

## Run locally

You can open `index.html` directly in a browser, or use VS Code Live Server for easier development.

## Hosting

Because this is a static website, it can be hosted on:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any normal web hosting with HTML/CSS/JS support

## Important payment note

For a production store, payment confirmation should be verified on a backend/serverless endpoint using Paystack's verification/webhook mechanisms. The static version is the storefront and checkout UI; WhatsApp is used for order communication.
