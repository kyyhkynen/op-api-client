require('dotenv').config();

const OPClient = require('../');
const testUsers = require('./testUsers.json');

async function pay(amount, fromUser, toUser) {
    const from = {
        client: new OPClient(process.env.OP_API_KEY)
    };
    const to = {
        client: new OPClient(process.env.OP_API_KEY)
    };

    try {
        await from.client.authorize(fromUser.authToken);
        await to.client.authorize(toUser.authToken);
    } catch (err) {
        console.error('Error on auth;', err.response ? await err.response.json() : err.message);
    }

    try {
        // just use first available accounts
        from.account = (await from.client.accounts.find())[0];
        to.account = (await to.client.accounts.find())[0];
    } catch (err) {
        console.error('Error getting account data;', err.response ? await err.response.json() : err.message);
        return;
    }

    let payment;
    try {
        payment = await from.client.payments.initiate({
            amount: amount,
            payerIban: from.account.iban,
            receiverIban: to.account.iban,
            receiverName: 'Hannes Gebhard'
        });
    } catch (err) {
        console.error('Error initiating payment;', err.response ? await err.response.json() : err.message);
        return;
    }

    try {
        payment = await from.client.payments.confirm(payment);
    } catch (err) {
        console.error('Error confirming payment;', err.response ? await err.response.json() : err.message);
        return;
    }

    console.log('Payment confirmed; ', payment);

    console.log('Payer transactions;', await from.client.accounts.findTransactions(from.account.accountId));
}

pay(10, testUsers[0], testUsers[1]);
