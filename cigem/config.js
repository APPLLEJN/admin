/**
 *  Zaih-ZhiPanel - config
 */
var path = require("path");

module.exports = {
    port: process.env.SERVER_PORT || 3000,
    debug: process.env.NODE_ENV !== 'production',
    static_dir: '/public',

    // sessions
    cookie_secret: 'I am fine, thank you, and you',

    // token type
    user_token_type: 'Bearer',
    base_token_type: 'Basic',

    // token
    base_token: 'cGFuZWw6a3RCVkJkNFdpdHlmQ0JFRWdqRzRFZU5aQnhHRXRY'
}
