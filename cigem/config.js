/**
 *  Zaih-ZhiPanel - config
 */
var path = require("path");

module.exports = {
    port: process.env.SERVER_PORT || 3000,
    debug: process.env.NODE_ENV !== 'production',
    static_dir: '/public',

    // paths
    host: process.env.ZHIFUBAO_PORT_8888_HTTP_PROTO || 'http://fdtsh.zaih.com',
    wanted_host: process.env.WANTED_PORT_8890_HTTP_PROTO || 'http://talk-fd-fdtsh.zaih.com',
    speech_host: process.env.SPEECH_PORT_8892_HTTP_PROTO || 'http://fdtsh-fd-speech.zaih.com',
    censor_host: process.env.CENSOR_PORT_8989_HTTP_PROTO || 'http://fdtsh-fd-censor.zaih.com',
    board_host: process.env.BOARD_PORT_8888_HTTP_PROTO || 'http://fdtsh.zaih.com',
    headline_host: process.env.TOUTIAO_PORT_8896_HTTP_PROTO || 'http://tt-apis-fdtsh.zaih.com',
    auth_host: process.env.AUTH_PORT_8897_HTTP_PROTO || "http://fdtsh-fd-auth.zaih.com",
    feed_host: process.env.FEED_PORT_8891_HTTP_PROTO || "http://fdtsh-fd-feed.zaih.com",
    bank_host: process.env.BANK_PORT_8898_HTTP_PROTO || "http://fdtsh-fd-bank.zaih.com",
    column_host: process.env.SUB_PORT_8899_HTTP_PROTO || 'http://sub-fdtsh.zaih.com',
    push_host: process.env.HORN_PORT_8893_HTTP_PROTO || 'http://horn-fdtsh.zaih.com',
    login_path: '/panel/login',
    logout_path: '/panel/logout',
    v1_path: '/panel/v1',
    auth_path: '/panel/auth_api',
    feed_api_path: '/panel/feed_api',
    bank_api_path: '/panel/bank_api',
    bank_export_path: '/panel/bank_export',

    // sessions
    cookie_secret: 'I am fine, thank you, and you',

    // token type
    user_token_type: 'Bearer',
    base_token_type: 'Basic',

    // token
    base_token: 'cGFuZWw6a3RCVkJkNFdpdHlmQ0JFRWdqRzRFZU5aQnhHRXRY'
}
