const shortid = require('shortid');
const Url = require('../models/url');
async function createShortUrl(req, res) {
    const body = req.body;
    if (!body.url) {
        return res.status(400).json({ error: 'URL is required in the request body' });
    }
    if (!body.url.startsWith('http://') && !body.url.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid redirect URL. Must start with http:// or https://' });
    }
    const shortID = shortid.generate();
    await Url.create({shortID: shortID, redirectUrl: body.url, visitHistory: [],createdBy: req.user._id});
    return res.redirect('/test?id=' + shortID);
}
async function getAnalytics(req, res) {
    const shortID = req.params.shortID;
    const urlEntry = await Url.findOne({shortID: shortID});
    if (!urlEntry) {
        return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ visitCount: urlEntry.visitHistory.length, visitHistory: urlEntry.visitHistory });
}

module.exports = {createShortUrl, getAnalytics};