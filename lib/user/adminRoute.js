const router = require("express").Router();
const facade = require('./adminFacade');
const validators = require('./userValidators');
const usrConst = require('./userConstants');
const mapper = require('./userMapper');
const { genUsrToken } = require('../jwtHandler');
const auth  = require('../middleware/auth')




router.route('/register').post( (req, res) => {

    let details = req.body
    console.log(req.body)
    facade.register(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


router.route('/login').post( (req, res) => {

    let details = req.body

    facade.login(details).then((result) => {
        console.log(result)
        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})




router.route('/forgotPassword').post((req, res) => {


    facade.resetPassword(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/sendPaymentRequest').post( (req, res) => {

   

    facade.sendPaymentRequest(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/sendPayinRequest').post( (req, res) => {

   

    facade.sendPayinRequest(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


router.route('/getAllUserTransactions').post( (req, res) => {

   

    facade.getAllUserTransactions(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllTransactions').post( (req, res) => {

   

    facade.getAllUsersTransactions(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})







module.exports = router