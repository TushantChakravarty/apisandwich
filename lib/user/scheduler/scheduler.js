const dao = require('../userDao')
const adminDao = require('../adminDao')

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
      yesterday:last24
    }
    //console.log(last24,yesterday)
    dao.updateProfile(query,updateObj)
  })
}

async function myFunction() {
    console.log('This is myFunction being executed.');
   const data =await adminDao.getAllTransactions({
    emailId:'samir123@payhub'
   })
   console.log(data)
   const last24 = data.last24hr
   const yesterday = data.yesterday
   const updateObj = {
    //totalVolume:Number(data.totalVolume)+10
    last24hr:0,
    yesterday:last24
   }
   let query ={
    emailId:'samir123@payhub'
   }
   updateUser()
   adminDao.updateProfile(query,updateObj)
  }
  
  module.exports = {
    myFunction,
  };