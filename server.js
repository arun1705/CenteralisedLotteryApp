const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('./db.js');
const {
    save_user_information,
    get_total_amount
} = require('./models/server_db');
const path = require('path');
const publicPath = path.join(__dirname, './public');
var paypal = require('paypal-rest-sdk');
const session = require('express-session');

app.use(session(
  {secret: 'my web app',
  cookie :{maxAge: 60000}
  }
));

app.use(bodyParser.json());
app.use(express.static(publicPath));

/*paypal configuration*/
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AX3yoPWh5IpZlMRPDF2RTEFNyawxqLMcs6ynZePbtkpFEpd8kvgl5YxwHRpk1EhjvIehiGFCjFSPpmgN',
    'client_secret': 'EJvPDiVtpKwjMbhQnACneWEh3ff1byBqbdKnaMur0ju6ZSCsTmwbuLIEZNkXfOq4UUBHe7Mo5rnU6Hoz'
});

app.post('/post_info', async (req, res) => {
    var email = req.body.email;
    var amount = req.body.amount

    if (amount <= 1) {
        return_info = {};
        return_info.error = true;
        return_info.message = "the amount should be greater than 1";
        return res.send(return_info);
    }
    var fee_amount = amount * 0.9;
    var result = await save_user_information({
        "amount": fee_amount,
        "email": email
    });
    req.session.paypal_amount = amount;

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "lottery",
                    "sku": "fundiing",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            'payee': {
                'email': 'lottery_test_manager@lotteryapp.com'
            },
            "description": "Lottery Purchase"
        }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            for (var i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel == 'approval_url') {
                    return res.send(payment.links[i].href);
                }
            }
        }
    });
});



app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": req.session.paypal_amount
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(payment);

        }
    });
    res.redirect('http://localhost:3000');
});

app.get('/get_total_amount', async (req, res) => {

    var result = await get_total_amount();
    res.send(result);
})

app.listen(3000, () => {
    console.log('server is running on port 3000')
});