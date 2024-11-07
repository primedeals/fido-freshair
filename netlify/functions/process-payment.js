const Square = require('square'); // Import the Square SDK

// Square client setup with environment and access token
const client = new Square.Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN, // Set this in Netlify's environment variables
    environment: 'sandbox' // Use 'production' when you go live
});

exports.handler = async (event, context) => {
    // Ensure the request method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    // Parse the request body
    const { token, amount } = JSON.parse(event.body);

    try {
        const paymentsApi = client.paymentsApi;

        // Create a unique idempotency key for each transaction to avoid duplicate charges
        const response = await paymentsApi.createPayment({
            sourceId: token,
            idempotencyKey: new Date().getTime().toString(), // Unique key for each payment
            amountMoney: {
                amount: amount, // Amount in cents, e.g., 2999 for $29.99
                currency: 'USD'
            }
        });

        if (response.result.payment) {
            // Send success response with the order ID for tracking
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, orderId: response.result.payment.id })
            };
        } else {
            // If payment fails, send a failure response
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Payment failed' })
            };
        }
    } catch (error) {
        console.error('Payment error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};