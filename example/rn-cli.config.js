const path = require('path');

const config = {
    extraNodeModules: {
        'react-native': path.resolve(__dirname, 'node_modules/react-native'),
        react: path.resolve(__dirname, 'node_modules/react'),
    },
    getProjectRoots() {
        return [
            // Keep your project directory.
            path.resolve(__dirname),
            path.resolve(__dirname, '..'), // path to the external module
        ];
    },
};
module.exports = config;
