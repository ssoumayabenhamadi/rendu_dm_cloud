const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRouter = require('./auth'); // Assurez-vous que le chemin vers le fichier auth.js est correct

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Dossier pour les fichiers statiques (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Utilisez le routeur d'authentification
app.use('/auth', authRouter); // Préfixe toutes les routes dans auth.js avec '/auth'
// Servir la page de connexion
app.get('/', function(request, response) {
    if (request.session.loggedin) {

        response.redirect('/home');
    } else {

        response.sendFile(path.join(__dirname, 'front', 'login.html'));
    }
});
// Route pour la page d'accueil après connexion
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.sendFile(path.join(__dirname, 'front', 'home.html')); // Assurez-vous que le chemin est correct
    } else {
        response.status(401).send('Veuillez vous connecter pour voir cette page !');
    }
});
app.get('/createvm', function(request, response) {
    let user = localStorage.getItem('user');
    if (request.session.loggedin && request.session.credits > 0 && user.role === 'admin') {
        createResources().then(() => {
            // Diminuez les crédits de l'utilisateur ici
            response.send("La VM est en cours de création.");
        }).catch(err => {
            console.log(err);
            response.status(500).send("Erreur lors de la création de la VM.");
        });
    } else {
        response.status(401).send("Non autorisé ou crédits insuffisants.");
    }
});

app.listen(3000, function() {
    console.log('Serveur démarré sur http://localhost:3000');
});
