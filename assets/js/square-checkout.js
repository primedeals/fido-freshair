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
        // Create order with Square
        const response = await fetch('https://connect.square.com/v2/online-checkout/orders', {
            method: 'POST',
            headers: {
                'Square-Version': '2024-01-17',
                'Authorization': `Bearer ${appId}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order: {
                    location_id: locationId,
                    line_items: [{
                        name: product.name,
                        quantity: '1',
                        base_price_money: {
                            amount: product.price,
                            currency: 'USD'
                        }
                    }]
                },
                checkout_options: {
                    redirect_url: 'https://primedeals.github.io/fido-freshair/success.html',
                    merchant_support_email: 'contact@crayforddigital.com',
                    ask_for_shipping_address: true,
                    allow_tipping: false,
                    enable_coupon: false,
                    enable_loyalty: false,
                },
                pre_populate_buyer_email: '',
                payment_note: `Purchase of ${product.name}`
            })
        });

        if (response.ok) {
            const result = await response.json();
            // Track analytics before redirect
            trackPurchase(product);
            // Redirect to Square's hosted checkout
            window.location.href = result.checkout.checkout_page_url;
        } else {
            const errorResult = await response.json();
            console.error('Square API Error:', errorResult);
            throw new Error('Failed to create checkout session');
        }

    } catch (error) {
        console.error('Square initialization error:', error);
        alert('Payment system initialization failed. Please try again.');
    }
}

// Analytics tracking functions remain the same
function trackPurchase(product) {
    // Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', 'begin_checkout', {
            value: product.price / 100,
            items: [{
                item_name: product.name,
                price: product.price / 100,
                quantity: 1
            }]
        });
    }

    // Facebook Pixel
    if (typeof fbq === 'function') {
        fbq('track', 'InitiateCheckout', {
            value: product.price / 100,
            currency: 'USD',
            content_name: product.name,
            content_type: 'product'
        });
    }
}