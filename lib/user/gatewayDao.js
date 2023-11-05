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
        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }).slice(0, 10);

        // Find the document
        const existingDocument = await GatewayData.findOne();

        if (existingDocument) {
            // Find the daily data for the current date
            const currentDayData = existingDocument.gatewayData.find((day) => day.date === currentDate);

            if (currentDayData) {
                // If data for the current date exists, push the new data
                currentDayData.data.push(newData);
            } else {
                // If no data exists for the current date, create a new data object
                existingDocument.gatewayData.push({
                    date: currentDate,
                    data: [newData]
                });
            }

            await existingDocument.save();
        } else {
            // If no document exists, create a new one with the current date and data
            const newDocument = new GatewayData({
                gatewayData: [{
                    date: currentDate,
                    data: [newData]
                }]
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