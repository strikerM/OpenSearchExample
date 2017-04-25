/**
 * Created by Florin on 4/5/2017.
 */

const express = require('express');
const compression = require('compression');
const request = require('request');
const config = require('./config');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(compression());

app.get('/fedeo', (req, res) => {
    makeRequest(function (err, xmlResponse) {
        res.send(xmlResponse).end();
    });
});

app.get('/opensearch/request', (req, res) => {
    const url = extractUrl(req.url, 'request');
    console.log('extracted url', url);
    respond(req, res, url);
});

app.get('/', (req, res) => {
    res.end('Hello');
});

app.listen(config.port, () => console.log('app started on port ' + config.port));

function respond(req, res, url) {
    if (!url) {
        console.error('no url extracted for', req.url);
        res.end();
    }
    else {
        request
            .get(url, {timeout: 10000})
            .on('error', function (err) {
                console.error('request get error', err);
                res.end();
            })
            .pipe(res)
            .on('error', function (err) {
                console.error('pipe error', err);
                res.end();
            });
    }
}

function makeRequest(cb) {
    request(config.fedeoDescrDoc, function (err, res, body) {
        if (err || !body || typeof body !== 'string') {
            return cb(err, '');
        }
        else {
            body = recursiveReplace(body, config.UrlTag1, config.UrlTag1Replace);
            body = recursiveReplace(body, config.UrlTag2, config.UrlTag2Replace);
            return cb(null, body);
        }
    });
}

function recursiveReplace(str, strToReplace, replaceWith) {

    var pos = str.indexOf(strToReplace);

    if (pos !== -1) {
        str = str.replace(strToReplace, replaceWith);
        return recursiveReplace(str, strToReplace, replaceWith)
    }
    else {
        return str;
    }

}

function extractUrl(url, type) {
    var extractedUrl = '',
        urlParts;

    if (typeof url !== 'string') {
        return extractedUrl;
    }

    switch (type) {
        case 'request':
            urlParts = url.split('/opensearch/request?');
            if (urlParts && urlParts.length === 2) {
                extractedUrl = config.fedeoAddress + urlParts[1];
            }
            break;

        default:
            break;
    }

    return extractedUrl;

}