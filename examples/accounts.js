require('dotenv').config();

const OPClient = require('../');
const testUsers = require('./testUsers.json');

async function totalBalance(user) {
    const client = new OPClient(process.env.OP_API_KEY);

    try {
        await client.authorize(user.authToken);
    } catch (err) {
        console.error('Error on auth;', err);
    }

    try {
        const accounts = await client.accounts.find();
        console.log(
            `Total balance on all ${user.name} accounts: `,
            accounts
                .map(account => account.balance)
                .reduce((total, current) => total + current)
                .toFixed(2)
        );
    } catch (err) {
        console.error('Error getting accounts;', err);
    }
}

testUsers.forEach(user => totalBalance(user));
