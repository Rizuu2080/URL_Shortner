const express = require('express');
const app = express();
const port = Number(process.env.PORT) || 8000;
const routes = require('./routes/url');
const {connect} = require('./connection');
const Url = require('./models/url');
const ejs = require('ejs');
const { createClient } = require('redis');
const path = require('path');
const staticRoute = require('./routes/staticRoute');
const userRoutes = require('./routes/user');
const cookieParser = require('cookie-parser'); 
const { authenticateUser, checkAuth } = require('./middleware/auth');

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
  
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', checkAuth, staticRoute);
app.use('/user', userRoutes);
app.get('/test', authenticateUser, async (req, res) => {
  const allUrls = await Url.find({createdBy: req.user._id});
  const newlyCreatedId = req.query.id;
  res.render("home",{ urls: allUrls, id: newlyCreatedId });
});

const redisClient = createClient({
    url: 'redis://127.0.0.1:6379' // Default local Redis address
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

connect('mongodb://localhost:27017/short_url')
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

redisClient.connect()
  .then(() => {
    console.log('Connected to Redis Cache');
  })
  .catch((err) => {
    console.error('Error connecting to Redis', err);
  });

app.use('/url', routes);

app.get('/:shortID', async (req, res) => {
  const shortID = req.params.shortID;
  try {
    const cachedUrl = await redisClient.get(`url:${shortID}`);
   if (cachedUrl) {
    // 1. We send our ONE allowed response instantly
    res.redirect(cachedUrl);

    Url.updateOne({shortID: shortID}, {$push: {visitHistory: new Date()}})
       .catch(err => console.log("Database update failed:", err));
    return; 
}
    const urlEntry = await Url.findOneAndUpdate({shortID:shortID}, {$push: {visitHistory: new Date()}}, {new: true});
  
  if (!urlEntry) {
    return res.status(404).json({ error: 'URL not found' });
  }
  await redisClient.set(`url:${shortID}`, urlEntry.redirectUrl, { EX: 3600 });

  res.redirect(urlEntry.redirectUrl);
}catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
});

app.post('/signout', (req, res) => {
  res.clearCookie('sessionId');
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = port + 1;
    console.log(`Port ${port} is busy. Trying ${fallbackPort} instead...`);
    app.listen(fallbackPort, () => {
      console.log(`Server is running on http://localhost:${fallbackPort}`);
    });
  } else {
    console.error(err);
  }
});