const dao = require('../userDao')
const adminDao = require('../adminDao')
const { getAllUserTx } = require('../adminService')

async function updateGatewayDetails(){
  const admin = await adminDao.getUserDetails({
    emailId:'samir123@payhub'
  })
  //console.log(admin.gateways)
  admin.gateways.map((item)=>{
    const body={
      yesterday:item.last24hr,
      yesterdayFee:item.feeCollected24hr,
      yesterdayTransactions:item.last24hrSuccess
    }
    console.log('body',body)
    adminDao.updateGateway(item.gatewayName,body)
  })
}


async function updateUser()
{
  const users = await dao.getAllUsersTransactions()
  // console.log(users)
  users.map((item)=>{
    const last24 = item.last24hr
    const yesterday = item.yesterday
    let query= {
      emailId:item.emailId
    }
    let updateObj ={
      last24hr:0,
      yesterday:last24,
      last24hrSuccess:0,
      last24hrTotal:0
    }
    //console.log(last24,yesterday)
    dao.updateProfile(query,updateObj)
  })
}
async function updateAdmin() {
  const data = await adminDao.getAllTransactions({
    emailId: 'samir123@payhub'
  });
  console.log(data);
  const user = await getAllUserTx()
  const last24 = data.last24hr;
  const updateObj = {
    last24hr: 0,
    yesterday: user.yesterdayObject.volume ,
    last24hrSuccess:0,
    last24hrTotal:0,
    feeCollected24hr:0
   
  };
  let query = {
    emailId: 'samir123@payhub'
  };
  
  adminDao.updateProfile(query, updateObj);
}

async function myFunction() {
  console.log('This is myFunction being executed.');

  updateUser();

  // Wrap the updateAdmin call in a try-catch block to handle any potential errors
  try {
    updateGatewayDetails()
    await updateAdmin();
  } catch (error) {
    console.error('Error updating admin:', error);
  }
}

  module.exports = {
    myFunction
    };