var path = require('path');
var webpack = require('webpack');
var minimist = require('minimist');

var production = (function(prod){
    var cliParams = minimist(process.argv.slice(2));
    prod = cliParams.production || cliParams.prod || cliParams.p || process.env.NODE_ENV === 'production' || false;
    return prod;
})({});

var entry = [ './src/js/index.jsx' ];
!production && entry.push('webpack-dev-server/client?http://localhost:8080');

module.exports = {
    entry: entry,
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, 'dist'),
        publicPath: '/dist/'
    },
    devtool: production ? 'source-map' : 'eval-source-map',
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.scss$/,
                loaders: [ 'style', 'css?sourceMap', 'autoprefixer', 'sass?sourceMap' ]
            },
            {
                test: /\.css$/,
                loaders: [ 'style', 'css?sourceMap', 'autoprefixer' ]
            },
            {
                test: /\.html$/,
                loaders: [ 'html' ]
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    sassLoader: {
        includePaths: [
            'src/scss',
            'src/scss/imports'
        ]
    }
};