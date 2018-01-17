const uuid = require('uuid/v4');
const { get, post } = require('./fetch');

const baseHeaders = {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-authorization': '',
    'x-session-id': '',
    'x-request-id': ''
};

module.exports = class {
    constructor(apiKey, options) {
        this._sessionId = '';
        this._authToken = '';
        this._headers = Object.assign({ 'x-api-key': apiKey }, baseHeaders, (options && options.headers) || {});
        this._options = Object.assign({}, options, { headers: this._headers });
    }

    authorize(authToken) {
        if (!authToken) {
            return Promise.reject('Hard-coded auth token not given!');
        }
        // only use hard-coded authorization header for now
        this._headers['x-authorization'] = authToken;
        // just mock session id for now
        this._sessionId = uuid();
        this._headers['x-session-id'] = this._sessionId;
        return Promise.resolve();
    }

    // accounts

    // exploit getters to get nice sturcture following the api structure
    get accounts() {
        return {
            find: () => get('/accounts', this._options),
            findById: accountid => get('/accounts/' + accountid, this._options),
            findTransactions: accountid => get('/accounts/' + accountid + '/transactions', this._options),
            findOneByTransactionId: accountId => get('/accounts/' + accountid + '/transactions/' + txid, this._options)
        };
    }

    // payments

    get payments() {
        return {
            initiate: payment => post('/payments/initiate', this._options, payment),
            confirm: payment => post('/payments/confirm', this._options, payment)
        };
    }

    // funds

    get funds() {
        return {
            getFunds: () => get('/funds', this._options),
            sellFunds: (isin, sellOrder) => post('/funds/' + isin + '/redemptions', this._options, sellOrder),
            buyFunds: (isin, buyOrder) => post('/funds/' + isin + '/subscriptions', this._options, buyOrder)
        };
    }

    // holdings

    get holdings() {
        return {
            getHoldings: () => get('/holdings', this._options)
        };
    }
};
