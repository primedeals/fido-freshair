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

        // Create payment request for Square Web Payment SDK
        const paymentRequest = await payments.paymentRequest({
            countryCode: 'US',
            currencyCode: 'USD',
            total: {
                amount: product.price.toString(),
                label: 'Total'
            }
        });

        // Create payment flow
        try {
            const paymentResponse = await paymentRequest.show();
            
            if (paymentResponse) {
                // Process payment token
                const { status, token } = await paymentResponse;
                
                if (status === 'OK') {
                    // Track purchase
                    trackPurchase(product);
                    
                    // Redirect to success page
                    window.location.href = './order-status.html';
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }

    } catch (error) {
        console.error('Square initialization error:', error);
        alert('Payment system initialization failed. Please try again.');
    }
}

// Analytics tracking functions
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