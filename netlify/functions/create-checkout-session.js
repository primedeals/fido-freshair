// Import the Stripe library
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Secret Key from environment variables

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        // Parse the request body to get the package information (e.g., 1-month or 3-month)
        const { packageType } = JSON.parse(event.body);

        // Define the products with their prices (amounts are in cents)
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

        // Create a new Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: selectedProduct.name
                        },
                        unit_amount: selectedProduct.price
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`, // Redirect URL after successful payment
            cancel_url: `${process.env.CANCEL_URL}` // Redirect URL if the user cancels the payment
        });

        // Return the session URL to the client
        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url })
        };

    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred while creating the checkout session' })
        };
    }
};