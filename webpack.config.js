let path = require('path');
let webpack = require('webpack');
let minimist = require('minimist');

let production = (function(prod) {
    let cliParams = minimist(process.argv.slice(2));
    prod = cliParams.production || cliParams.prod || cliParams.p || process.env.NODE_ENV === 'production' || false;
    return prod;
})({});

let entry = ['./src/js/index.jsx'];
!production && entry.push('webpack-dev-server/client?http://localhost:8080');

module.exports = {
    entry: entry,
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, 'dist'),
        publicPath: 'dist/',
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
                loaders: ['style', 'css?sourceMap', 'autoprefixer', 'sass?sourceMap']
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css?sourceMap', 'autoprefixer']
            },
            {
                test: /\.html$/,
                loaders: ['html']
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream"
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file"
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            },
            {
                test: /\.(png|jpg)$/,
                loader: "file-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.csv$/,
                loader: "csv-loader"
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    sassLoader: {
        includePaths: [
            'src/scss',
            'src/scss/imports',
            'node_modules'
        ]
    },
    csv: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
    }
};