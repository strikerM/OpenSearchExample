/**
 * Created by Florin on 1/23/2017.
 */

const path = require('path');
const outputFolderName = 'dev';

module.exports = {

    devtool: 'source-map',

    entry: {
        bundle: path.join(__dirname, 'src', 'index.js'),
    },

    output: {
        path: path.resolve(__dirname, 'builds', outputFolderName),
        filename: '[name].js'
    },
};