export async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // Fallback SMS phone number for trials
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+18559062323"; 

  if (!accountSid || !authToken) {
    console.log(`[SMS Simulation] To: ${to} | Message: ${body}`);
    return false;
  }

  // Format to E.164 standard for India (+91)
  let formattedTo = to.trim();
  if (!formattedTo.startsWith("+")) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else if (formattedTo.startsWith("91") && formattedTo.length === 12) {
      formattedTo = `+${formattedTo}`;
    }
  }

  try {
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: body
        }).toString()
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`[SMS Sent Successfully] SID: ${data.sid}`);
      return true;
    } else {
      console.error(`[Twilio SMS Error]: ${data.message} (Code: ${data.code})`);
      return false;
    }
  } catch (err) {
    console.error(`[Twilio SMS Exception]:`, err);
    return false;
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // Default sandbox WhatsApp number
  const fromNumber = "whatsapp:+14155238886"; 

  if (!accountSid || !authToken) {
    console.log(`[WhatsApp Simulation] To: ${to} | Message: ${body}`);
    return false;
  }

  // Format phone number
  let formattedTo = to.trim();
  if (!formattedTo.startsWith("+")) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    }
  }
  
  if (!formattedTo.startsWith("whatsapp:")) {
    formattedTo = `whatsapp:${formattedTo}`;
  }

  try {
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: body
        }).toString()
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`[WhatsApp Sent Successfully] SID: ${data.sid}`);
      return true;
    } else {
      console.error(`[Twilio WhatsApp Error]: ${data.message}`);
      return false;
    }
  } catch (err) {
    console.error(`[Twilio WhatsApp Exception]:`, err);
    return false;
  }
}
