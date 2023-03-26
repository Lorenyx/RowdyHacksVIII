const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const MessagingResponse = require('twilio/lib/twiml/MessagingResponse');

const app = express();

// Middleware
app.use(express.json())
app.use(cors());

///////////////////////
// --[ CONSTANTS ]-- //
///////////////////////
const accountSid = 'ACad12f26ada12dc0623cbe1c153537008';
const authToken = '9f84960566862a750a1a2d2f7f9958db';
const client = twilio(accountSid, authToken);

const USERS = { '0.0.420420': '+18305637519' } // map of users

const STATUS = {
    NOT_FOUND: 1,
    NOT_APPROVED: 2
}

/**
 * send-message
 */
app.get('/send-message', async (req, resp) => {
    console.log('Received request: ' + req.url);

    const { walletTo, walletFrom, amount, phoneNumber} = req.query;
    // const phoneNumber = '+18305637519'; //getPhoneNumber(walletFrom);

    // Handle error from phone number
    // if (phoneNumber.err === STATUS.NOT_FOUND) {
    //     console.error('Phone not found!');
    //     resp.status(404).json({ auth: 'false', reason: 'User does not have paired phone!' });
    //     return;
    // }
    try {
        // Send the initial text message
        const message = await client.messages.create({
            body: 'Hey there! We found a transaction:\nSend ' + amount + ' HBAR to "' + walletTo + '".\n\nType "Yes" to confirm or "No" to deny this request.',
            from: '+18305218952',
            to: phoneNumber
        });
        // Poll for incoming text messages
        const messageCheckInterval = setInterval(async () => {
            const messages = await client.messages.list({
                from: phoneNumber, // Replace with the recipient's phone number
                to: '+18305218952', // Replace with your Twilio phone number
            }).catch(err => console.error(err));;
            // Look for a response with either "Yes" or "No"
            const response = messages.find(message => /yes|no/i.test(message.body.toString()));
            if (response) {
                console.log(`Received response with SID: ${response.sid}`);
                console.log("msg: "+response.body.toString());
                clearInterval(messageCheckInterval);
                // Handle the response here
                if (response.body.toString() === 'Yes') {
                    resp.status(200).json({ auth: 'true', reason: '' });
                } else {
                    resp.status(302).json({ auth: 'false', reason: 'Authorization failed!' });
                }
            }
        }, 10000); // Check for messages every 10 seconds
    } catch (error) {
        console.error(`Error sending or receiving message: ${error}`);
    }
})


app.get('/test', (req, res) => {
    console.log('received get!');
});

function formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if the number starts with a 0, and remove it
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;

    // Add the country code prefix
    return `+${withoutLeadingZero}`;
}


function getPhoneNumber(walletFrom) {
    let phoneNumber = USERS[walletFrom] || null;
    const status = STATUS.OK;
    if (phoneNumber === null) {
        status = STATUS.NOT_FOUND;
    }
    return { err: status, val: phoneNumber };
}

// Start the server
var server = app.listen(42069, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})
