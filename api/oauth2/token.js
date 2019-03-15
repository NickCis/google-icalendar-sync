const micronize = require('../utils/micronize');
const OAuth2Client = require('../utils/OAuth2Client');
const { send } = require('micro');
const query = require('micro-query');
const redirect = require('../utils/redirect');

module.exports = micronize(async (req, res) => {
  const q = query(req);

  if (q.code) {
    const oauth2Client = new OAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(q.code);

    redirect(res, `/?tokens=${encodeURIComponent(JSON.stringify(tokens))}`, 302);
    return;
  }

  redirect(res, '/?invalid=true', 302);
});
