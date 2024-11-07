// assets/js/square-checkout.js
const products = {
    'starter-package': {
        price: 2999,
        name: '1-Month Starter Package',
        quantity: 1
    },
    'premium-package': {
        price: 6597,
        name: '3-Month Premium Package',
        quantity: 1
    }
};

async function initiateSquarePayment(productId) {
    const appId = 'sq0idp-k3phA5tx6BCvUMGzP2cPQg'; // Replace with your Square app ID
    const locationId = 'LHT54CDG5520W'; // Replace with your Square location ID
    const product = products[productId];

    try {
        // Create Square payments instance
        const payments = window.Square.payments(appId, locationId);

        // Initialize payment request
        const paymentRequest = {
            countryCode: 'US',
            currencyCode: 'USD',
            lineItems: [{
                amount: product.price,
                label: product.name,
                quantity: product.quantity.toString()
            }],
            total: {
                amount: product.price,
                label: 'Total'
            }
        };

        // Initialize Square payment form
        const card = await payments.card();
        
        // Create pre-authorized payment with Square
        const response = await fetch('https://connect.squareupsandbox.com/v2/payments', {
            method: 'POST',
            headers: {
                'Square-Version': '2024-01-17',
                'Authorization': `Bearer ${appId}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_id: await card.tokenize(),
                amount_money: {
                    amount: product.price,
                    currency: 'USD'
                },
                autocomplete: false, // This makes it a pre-authorization
                idempotency_key: Date.now().toString(),
                note: `Pre-auth for ${product.name}`,
                customer_id: generateCustomerId(), // Optional: If you want to track customers
                reference_id: generateOrderReference(productId) // Your custom order reference
            })
        });

        if (response.ok) {
            // Track authorization events
            trackAuthorization(product);
            
            // Redirect to pending order page
            window.location.href = './order-status.html';
        } else {
            throw new Error('Authorization failed');
        }

    } catch (error) {
        console.error('Authorization error:', error);
        alert('Payment authorization failed. Please try again.');
    }
}

// Helper functions
function generateCustomerId() {
    return `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateOrderReference(productId) {
    return `ORDER_${productId}_${Date.now()}`;
}

// Analytics tracking functions
function trackAuthorization(product) {
    // Google Analytics
    gtag('event', 'begin_checkout', {
        value: product.price / 100,
        items: [{
            item_name: product.name,
            price: product.price / 100,
            quantity: product.quantity
        }]
    });

    // Facebook Pixel
    fbq('track', 'InitiateCheckout', {
        value: product.price / 100,
        currency: 'USD',
        content_name: product.name,
        content_type: 'product'
    });
}