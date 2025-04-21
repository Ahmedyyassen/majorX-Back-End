const oneMinuteExpiry = async(otpTime)=>{
    try {        
        var diffrenceTime = (new Date().getTime() - otpTime)/1000;
        diffrenceTime /= 60;

        if (diffrenceTime > 1) {
            return true;
        }
        return false;

    } catch (error) {
       throw new Error("OTP Validate", error);        
    }
}

const threeMinuteExpiry = async(otpTime)=>{
    try {        
        var diffrenceTime = (new Date().getTime() - otpTime)/1000;
        diffrenceTime /= 60;

        if (diffrenceTime > 3) {
        return true;
        }
        return false;

    } catch (error) {
       throw new Error("OTP Validate", error);        
    }
}
module.exports = {
    oneMinuteExpiry,
    threeMinuteExpiry
}