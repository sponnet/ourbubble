const configs = {
    development: {
        name: "dev",
        admin: true,
        api: {
             URL: "wss://acloud.ava.do",
             HTTPURL: "https://acloud.ava.do"
            // URL: "ws://localhost:5003",
            // HTTPURL: "http://localhost:5003"
        },
        dateformat: "DD.MM.YY"
    },

    production: {
        name: "prod",
        admin: true,
        api: {
            URL: "wss://acloud.ava.do",
            HTTPURL: "https://acloud.ava.do"
        },
        dateformat: "DD.MM.YY"

    }
};
let config = process.env.REACT_APP_STAGE
    ? configs[process.env.REACT_APP_STAGE]
    : configs.development;

export default {
    ...config
};
