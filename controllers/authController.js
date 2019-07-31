const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
var mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'you\'re Logged In'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are successfully logged out');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'you must be logged in');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  // 1. check if the email is registered.
  const user = await User.findOne({ email: req.body.email })
  req.flash('info', 'If an account exists a reset email has been sent.');
  if(!user) {
    // req.flash('error', 'No account exists with this email.');
    return res.redirect('/login');
  }
  // 2. reset tokens and expiry on the account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // +1 hour
  await user.save();
  // 3. send email with token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
  await mail.send({
    user,
    subject: 'password reset',
    resetURL,
    filename: 'password-reset'
  })

  req.flash('success', `Check your email for a password reset link.`);
  // 4. redirect to login after email token is sent
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  // 1. check if the token exists on a user
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // date is greater than now.
  });
  // 2. check if the token has not expired
  if (!user){
    req.flash('error', 'Password reset token is not valid, or expired.');
    return res.redirect('/login');
  }
  res.render('reset', { title: 'Reset your Password' });
};

exports.confirmPassword = async (req, res, next) => {
  if (req.body.password === req.body['password-confirm']){
    next();
    return;
  }
  req.flash('error', 'passwords do no match');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // date is greater than now.
  });

  if (!user){
    req.flash('error', 'Password reset token is not valid, or expired.');
    return res.redirect('/login');
  }

  await user.setPassword(req.body.password);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();

  //login user
  await req.login(updatedUser);
  req.flash('success', 'Your password has been updated and you are logged in.');
  res.redirect('/');
};