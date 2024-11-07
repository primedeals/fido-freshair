const products = {
    'starter-package': {
        price: 2999,
        name: '1-Month Starter Package',
        checkoutUrl: 'https://square.link/u/KfB2uLq9'
    },
    'premium-package': {
        price: 6597,
        name: '3-Month Premium Package',
        checkoutUrl: 'https://square.link/u/3uZVoOWz'
    }
};

function initiateSquarePayment(productId) {
    const product = products[productId];
    
    // Track analytics before redirect
    // trackPurchase(product); note: removed prior to analytics setup
    
    // Redirect to Square's hosted checkout
    window.location.href = product.checkoutUrl;
}