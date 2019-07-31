const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user:  process.env.MAIL_USER,
    pass:  process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html =  pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html)
  return inlined;
}

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: `Wes Bos <noreply@wesbos.com>`,
    to: options.user.email,
    subject: options.subject,
    // html: html, conviently collapses to the line bleow
    html,
    text
  }
  await transport.sendMail(mailOptions);
}