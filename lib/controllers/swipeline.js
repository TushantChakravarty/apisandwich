const sendSwipelineQrRequest = async (details) => {
    let formData = new FormData();
    formData.append('mid', 'SLCOS000019DELH');
    formData.append('payload', details.payload);
  
    try {
      const response = await fetch("https://merchant.swipelinc.com/paymentrequest", {
        method: 'POST',
        body: formData,
      });
    console.log(response)
    const responseText = await response.text();
console.log('Response Text:', responseText);
      if (response.ok) {
        const json = await response.json();
        return json;
      } else {
        console.error("Failed to fetch data. Status:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }
module.exports={
    sendSwipelineQrRequest
}