// Load user routes
const usrRouter = require('../user/userRoute')
const adminRouter = require('../user/adminRoute')
const reportsRouter = require('../user/reportsRoute')
const supportRouter = require('../support/supportRoutes')
const callbackRouter = require('../user/callbacks/callbackRoutes')

//========================== Load Modules End ==============================================

//========================== Export Module Start ====== ========================

module.exports = function (app) {
    app.get("/", (req, res) => {
        res.sendStatus(200);
    })
    app.use('/user', usrRouter)
    app.use('/admin',adminRouter)
    app.use('/admin/reports',reportsRouter)
    app.use('/support',supportRouter)
    app.use('/callback',callbackRouter)


};
