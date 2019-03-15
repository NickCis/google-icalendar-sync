const { google } = require('googleapis');

class OAuth2Client extends google.auth.OAuth2 {
  constructor(req) {
    super(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `https://${req.headers.host}/api/oauth2/token.js`
    );
  }
}

module.exports = OAuth2Client;
