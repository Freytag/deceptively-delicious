exports.myMiddleware = (req, res, next) => {
  req.name = 'wes';
  next();
}
exports.homePage = (req, res) => {
  res.render('index');
}
