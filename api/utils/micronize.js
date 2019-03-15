const { run } = require('micro');

module.exports = fn => (req, res) => run(req, res, fn);
