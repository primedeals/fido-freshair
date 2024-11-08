const fetch = require('node-fetch');

exports.handler = async (event) => {
    const token = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
    const pixelId = '577914958130617'; // Your Meta Pixel ID

    // Parse the event body to get data from the client
    const body = JSON.parse(event.body);

    // Define the payload to send to Meta
    const payload = {
        data: [
            {
                event_name: body.eventName || 'PageView', // Event type
                event_time: Math.floor(Date.now() / 1000), // Current timestamp
                action_source: 'website', // Action source
                event_source_url: body.url || 'https://primedeals.github.io/fido-freshair/', // Your website URL
                user_data: {
                    client_ip_address: event.headers['client-ip'],
                    client_user_agent: event.headers['user-agent']
                },
                custom_data: {
                    currency: 'USD',
                    value: body.value || 0 // Adjust the value based on the product price
                }
            }
        ]
    };

    try {
        // Send a POST request to Meta's Conversions API
        const response = await fetch(`https://graph.facebook.com/v12.0/${pixelId}/events?access_token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, data })
        };
    } catch (error) {
        console.error('Meta Conversions API error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};