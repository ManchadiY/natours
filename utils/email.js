const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

//new Email(user,url)
module.exports = class Email {
  constructor(user, url) {
    this.firstName = user.name.split(' ')[0];
    this.to = user.email;
    this.url = url;
    this.from = `${process.env.EMAIL_FROM}`;
  }

  NewTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   //send grid
    //   return 1;
    // }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //send the actual mail
  async send(template, subject) {
    //render html based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //define mail options
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    //create a transport and send mail
    await this.NewTransport().sendMail(mailOption);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password reset token (valid only for 10mins)'
    );
  }
};

// const sendEmail = async (options) => {
//   //1)create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   //2)define the email option
//   const mailOption = {
//     from: 'yuvraj manchadi <hello@yuvraj.io>',
//     to: options.email,
//     sub: options.subject,
//     text: options.message,
//   };

//   //3)actually send the email

//   await transporter.sendMail(mailOption);
// };

// module.exports = sendEmail;
