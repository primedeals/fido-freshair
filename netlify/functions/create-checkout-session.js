const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://primedeals.github.io',
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
            '1-month': {
                price: 2999,
                name: 'Fido FreshAir™ Calming Spray - 1-Month Starter (For Anxious Pets)',
                image: 'https://primedeals.github.io/fido-freshair/assets/images/product/bottle-main.png'
            },
            '3-month': {
                price: 6597,
                name: 'Fido FreshAir™ Calming Spray - 3-Month Premium Pack (Best Value for Lasting Relief)',
                image: 'https://primedeals.github.io/fido-freshair/assets/images/product/three-pack.png'
            }
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
                        product_data: {
                            name: selectedProduct.name,
                            images: [selectedProduct.image]
                        },
                        unit_amount: selectedProduct.price
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&price=${selectedProduct.price / 100}`,
            cancel_url: 'https://primedeals.github.io/fido-freshair/',
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://primedeals.github.io',
            },
            body: JSON.stringify({ url: session.url })
        };
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://primedeals.github.io',
            },
            body: JSON.stringify({ message: 'An error occurred while creating the checkout session' })
        };
    }
};