module.exports = (res, loc, code = 301) => {
  res.statusCode = code;
  res.setHeader('Location', loc);
  res.end();
};
