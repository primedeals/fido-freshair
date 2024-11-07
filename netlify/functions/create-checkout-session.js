const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        // Preflight request handling for CORS
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://primedeals.github.io', // Your GitHub Pages URL
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        const { packageType } = JSON.parse(event.body);
        const products = {
            '1-month': { price: 2999, name: '1-Month Starter Package' },
            '3-month': { price: 6597, name: '3-Month Premium Package' }
        };
        const selectedProduct = products[packageType];

        if (!selectedProduct) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid package type selected' })
            };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: selectedProduct.name },
                        unit_amount: selectedProduct.price
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CANCEL_URL}`
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://primedeals.github.io', // Your GitHub Pages URL
            },
            body: JSON.stringify({ url: session.url })
        };
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://primedeals.github.io', // Your GitHub Pages URL
            },
            body: JSON.stringify({ message: 'An error occurred while creating the checkout session' })
        };
    }
};