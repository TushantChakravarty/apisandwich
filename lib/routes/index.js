// Load user routes
const usrRouter = require('../user/userRoute')
const adminRouter = require('../user/adminRoute')

//========================== Load Modules End ==============================================

//========================== Export Module Start ====== ========================

module.exports = function (app) {
    app.get("/", (req, res) => {
        res.sendStatus(200);
    })
    app.use('/user', usrRouter)
    app.use('/admin',adminRouter)

};
