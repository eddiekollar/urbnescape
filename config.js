
module.exports = {
    auth: {
        LOGIN_URL: '/login',
        SUCCESS_REDIRECT_URL: '/',
        FAILURE_REDIRECT_URL: '/login'
    },
    db: {
        production: "mongodb://user:pass@example.com:1234/sapling-prod",
        development: "mongodb://localhost/urbnescape",
        test: "mongodb://localhost/urbnescape"
    },
    mailer: {
        auth: {
            user: 'test@example.com',
            pass: 'secret'
        },
        defaultFromAddress: 'First Last <test@examle.com>'
    },
    fb: {
        appId: '640008739351430'
        , appSecret: '918715fbba50580edbd07aa8f42e9245'
    }
};

