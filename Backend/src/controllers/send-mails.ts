import nodemailer from "nodemailer";

export default async function handle_send_mails(req: any, res: any) {
  const { link, domain, eventName } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.APP_PASS,
    },
  });

  (async () => {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "harshityadav5499@gmail.com",
      subject: "Congrats for winning",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
    <h2 style="font-size: 20px; color: #111; margin-bottom: 8px;">Congratulations</h2>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      You have won the <strong>${eventName}</strong> event. Your certificate has been issued.
    </p>
    <a href="${link}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">
      View Certificate
    </a>
    <p style="margin-top: 32px; font-size: 13px; color: #999;">
      For any queries, contact ${domain}
    </p>
  </div>
`,
    });

    res.send("email sent");
  })();
  return res.send("email sent");
}
