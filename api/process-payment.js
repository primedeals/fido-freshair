const Square = require('square'); // Import the Square SDK

// Square client setup with environment and access token
const client = new Square.Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN, // Set this in Vercel's environment variables
    environment: 'sandbox' // Use 'production' when you go live
});

module.exports = async (req, res) => {
    // Ensure the request method is POST
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { token, amount } = req.body; // Extract payment token and amount from the request body

    try {
        const paymentsApi = client.paymentsApi;
        
        // Create a unique idempotency key for each transaction to avoid duplicate charges
        const response = await paymentsApi.createPayment({
            sourceId: token,
            idempotencyKey: new Date().getTime().toString(),
            amountMoney: {
                amount: amount, // Amount in cents, e.g., 2999 for $29.99
                currency: 'USD'
            }
        });

        if (response.result.payment) {
            // Send success response with the order ID for tracking
            res.status(200).json({ success: true, orderId: response.result.payment.id });
        } else {
            // If payment fails, send a failure response
            res.status(500).json({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};