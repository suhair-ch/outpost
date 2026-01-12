
import axios from 'axios';

const SMS_API_KEY = process.env.SMS_API_KEY;

export const sendSms = async (mobile: string, message: string) => {
    // Development / Fallback Mode
    if (!SMS_API_KEY) {
        console.log(`[SMS-MOCK] To: ${mobile} | Message: ${message}`);
        return true;
    }

    // Real SMS Mode (Fast2SMS Example)
    try {
        await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: mobile,
        }, {
            headers: {
                "authorization": SMS_API_KEY,
                "Content-Type": "application/json"
            }
        });
        console.log(`[SMS-SENT] To: ${mobile}`);
        return true;
    } catch (error: any) {
        console.error(`[SMS-FAIL] To: ${mobile} | Error: ${error.message}`);
        // Fallback log even if API fails, so we can debug
        console.log(`[SMS-FALLBACK-LOG] Message was: ${message}`);
        return false;
    }
};

export const notifyParcelParticipants = async (parcel: any, message: string) => {
    // Send to Sender
    if (parcel.senderMobile) {
        await sendSms(parcel.senderMobile, message);
    }
    // Send to Receiver
    if (parcel.receiverMobile) {
        await sendSms(parcel.receiverMobile, message);
    }
};
