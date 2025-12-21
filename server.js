require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const indexRouter = require('./routes/index');
const chatController = require('./controllers/chatController');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'kunci_rahasia_toko',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/', indexRouter);
app.get('/chat', chatController.getChatPage);
app.post('/chat', chatController.sendMessage);
app.post('/chat/clear', chatController.clearChat); // Rute hapus chat

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});