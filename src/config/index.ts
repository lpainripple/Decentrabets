let config_file = require("./config.production")

if (process.env.NODE_ENV != 'production') {
    config_file = require("./config.test")
}

module.exports = config_file;