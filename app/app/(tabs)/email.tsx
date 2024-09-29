import React from 'react';
import { Button, View } from 'react-native';
import email from 'react-native-email';

const SendEmailExample = () => {
  const handleEmail = () => {
    const to = ['example@example.com']; // email addresses
    email(to, {
      // Optional fields:
      subject: 'Subject of the email',
      body: 'Body of the email',
      cc: 'cc@example.com',  // CC recipients (optional)
      bcc: 'bcc@example.com', // BCC recipients (optional)
    }).catch(console.error);
  };

  return (
    <View style={{ marginTop: 50 }}>
      <Button title="Send Email" onPress={handleEmail} />
    </View>
  );
};

export default SendEmailExample;
