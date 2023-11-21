const crypto = require('crypto');
const axios = require('axios');

const salt_key = "0b1ab943-cf1b-49cd-84a5-27131fcb909f"
const merchant_id = "M15N4WTCAKPN"

const newPayment = async () => {
    try {
        console.log("this is the salt_key", salt_key)
        console.log("this is the salt_key", merchant_id)
        const merchantTransactionId = 'TRAN76885322J';
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: 'M123ddhg',
            name: 'Tushant',
            amount: 100 * 100,
            redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
            redirectMode: 'POST',
            mobileNumber: 9340079982,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };


        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        console.log(checksum)
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>", payloadMain)


        axios.request(options).then(function (response) {
            console.log(response.data.data.instrumentResponse.redirectInfo.url)
            //eturn res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
        })
            .catch(function (error) {
                console.error(error);
            });

    } catch (error) {
        // res.status(500).send({
        //     message: error.message,
        //     success: false
        // })
        console.log(error)
    }
}

const checkStatus = async (req, res) => {
    const merchantTransactionId = res.req.body.transactionId
    const merchantId = res.req.body.merchantId

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: 'GET',
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    // CHECK PAYMENT TATUS
    axios.request(options).then(async (response) => {
        if (response.data.success === true) {
            const url = `http://localhost:3000/success`
            return res.redirect(url)
        } else {
            const url = `http://localhost:3000/failure`
            return res.redirect(url)
        }
    })
        .catch((error) => {
            console.error(error);
        });
};

module.exports = {
    newPayment,
    checkStatus
}