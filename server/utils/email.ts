import nodemailer from 'nodemailer';

// Generate SMTP service account from ethereal.email
let transporter: nodemailer.Transporter | null = null;

async function createTestAccount() {
  if (transporter) return;
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("Ethereal Email Test Account Created:");
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
  } catch (error) {
    console.error("Failed to create Ethereal account:", error);
  }
}

// Initialize on load
createTestAccount();

export async function sendNotificationEmail(to: string, subject: string, htmlContent: string) {
  if (!transporter) {
    await createTestAccount();
  }
  
  if (!transporter) {
    throw new Error("Email transporter not initialized");
  }

  try {
    const info = await transporter.sendMail({
      from: '"OrgTask System" <notifications@orgtask.local>', // sender address
      to, 
      subject, 
      html: htmlContent, 
    });

    console.log("\n-------------------------------------------");
    console.log("📨 NEW EMAIL NOTIFICATION SENT!");
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("-------------------------------------------\n");
    
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
