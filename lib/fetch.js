// fetch boilerplate

const fetch = require('node-fetch');
const uuid = require('uuid/v4');
const HttpsProxyAgent = require('https-proxy-agent');

const API_ENDPOINT = 'https://sandbox.apis.op-palvelut.fi/v1';

// use proxy when provided
const proxyAgent = !!process.env.HTTPS_PROXY ? new HttpsProxyAgent(process.env.HTTPS_PROXY) : null;

function stringifyBody(body) {
    return typeof body === 'string' ? body : JSON.stringify(body);
}

function request(method, resource, options, body) {
    const opts = Object.assign(
        {
            method: method,
            agent: proxyAgent
        },
        options
    );
    const url = API_ENDPOINT + resource;

    // generate request id
    opts.headers['x-request-id'] = uuid();

    return fetch(url, opts)
        .then(async response => {
            if (!response.ok) {
                let error = new Error(response.status + ' ' + response.statusText);
                // add response to error object so whoever catches it may do something about it; TODO: custom error class
                error.response = response;
                throw error;
            }
            return response;
        })
        .then(response => response.json())
        .catch(err => {
            console.error(`Error fetching resource ${resource};`, err.message);
            throw err;
        });
}

exports.get = (resource, options) => {
    return request('GET', resource, options);
};

exports.post = (resource, options, body) => {
    options.body = stringifyBody(body);
    return request('POST', resource, options);
};
