const mongoose = require('mongoose')
let BaseDao = require('../dao/BaseDao')

const constants = require('../constants')

const GatewayData = require('../generic/models/gatewayData'); // Import your GatewayData model
const Admin = require('../generic/models/adminModel')
const user =  require('../generic/models/userModel')
const adminDao = new BaseDao(Admin);
const usrDao = new BaseDao(user)



/*#################################            Load modules end            ########################################### */


/**
 * Get user details
 * @param {Object} query query to find user details
 */
function getUserDetails(query) {
    

    return adminDao.findOne(query)
}

// Function to push data into the date array
async function pushDataForToday(newData) {
    try {
        // Get the current date in the format "YYYY-MM-DD"
        const currentDate = new Date().toISOString().slice(0, 10);

        // Find a document for the current day
        const existingDocument = await GatewayData.findOne({ 'gatewayData.date': currentDate });

        if (existingDocument) {
            // If a document exists for the current day, find the current day's object and push data into its data array
            const currentDayData = existingDocument.gatewayData[0].data.find((day) => day.date === currentDate);

            if (currentDayData) {
                currentDayData.data.push(newData);
            } else {
                // If there's no data for the current day, create a new data array and push the data
                existingDocument.gatewayData[0].data = [{ date: currentDate, data: [newData] }];
            }
        } else {
            // If no document exists for the current day, create a new document and push the data
            const newDocument = new GatewayData({
                gatewayData: [
                    {
                        date: currentDate,
                        data: [newData]
                    }
                ]
            });

            await newDocument.save();
        }

        console.log('Data pushed for the current day.');
    } catch (error) {
        console.error('Error pushing data for the current day:', error);
    }
}
async function fetchDataForCurrentDate() {
    try {
        // Get the current date in the format "YYYY-MM-DD"
        const currentDate = new Date().toISOString().slice(0, 10);

        // Find a document for the current day
        const document = await GatewayData.findOne({ 'gatewayData.date': currentDate });

        if (document) {
            // Document for the current day found, you can access its data array
            console.log('Data for the current day:', document.gatewayData[0].data);
        } else {
            console.log('No data found for the current day.');
        }
    } catch (error) {
        console.error('Error fetching data for the current day:', error);
    }
}



module.exports = {

 
    getUserDetails,

    pushDataForToday,

    fetchDataForCurrentDate


}