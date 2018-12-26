const path = require('path');

module.exports = {
    resolver: {
        extraNodeModules: {
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-native': path.resolve(
                __dirname,
                'node_modules/react-native'
            ),
        },
    },
    projectRoot: path.resolve(__dirname),
    watchFolders: [path.resolve(__dirname, '..')],
};
