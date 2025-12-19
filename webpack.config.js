const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    entry: {
        ...defaultConfig.entry(),
        'frontend/tabs': path.resolve(__dirname, 'src/frontend/tabs.js'),
    },
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'build'),
    },
};
