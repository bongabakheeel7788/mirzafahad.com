// Build-time cache-busting token — changes on every deploy
module.exports = { v: String(Date.now()).slice(0, 10) };
