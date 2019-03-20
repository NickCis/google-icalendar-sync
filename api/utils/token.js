function parse(str) {
  const [access_token, expiry_date, refresh_token] = str.split('|');

  return {
    access_token,
    expiry_date,
    token_type: 'Bearer',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    refresh_token: `1/${refresh_token}`,
  };
}

function stringify(token) {
  return `${token.access_token}|${
    token.expiry_date
  }|${token.refresh_token.substring(2)}`;
}

module.exports = {
  parse,
  stringify,
};
