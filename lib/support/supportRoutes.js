const router = require("express").Router();
const facade = require('./supportFacade');
const usrConst = require('../user/userConstants');
const mapper = require('../user/userMapper');


router.route('/getAllMerchants').post( (req, res) => {
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    facade.getAllMerchants(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})
router.route('/addAgent').post( (req, res) => {
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    facade.addAgent(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


router.route('/verifyAgent').post( (req, res) => {
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    facade.verifyAgent(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

module.exports = router
