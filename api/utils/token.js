function parse(str) {
  const [access_token, expiry_date] = str.split('|');

  return {
    access_token,
    expiry_date,
    token_type: 'Bearer',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  };
}

function stringify(token) {
  return `${token.access_token}|${token.expiry_date}`;
}

module.exports = {
  parse,
  stringify,
};
