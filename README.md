## Pour commencer

La première chose à faire est d'installer les différents packages utilisés par le projet

```bash
npm i

```

La seconde chose à faire est de créer un fichier .env à la racine du projet et de le compléter afin d'assurer l'accès et l'utilisation des différentes ressources nécessaires. Vous trouverez à la racine un fichier .env.dist qui sert de sample 

```
/// Le secret de création des jeton
SECURITY__JWT__SECRET = "CECI EST UN SUPER SECRET"

/// L'ID Locataire trouvable sur Azure Microsoft ENTRA
AZURE_TENANT_ID = "VOTRE ID LOCATAIRE ICI"

/// L'ID Client lui aussi trouvable sur Azure Microsoft ENTRA
AZURE_CLIENT_ID = "VOTRE ID CLIENT ICI"

/// Le secret créé sur Azure Microsoft ENTRA que vous avez créé au préalable
AZURE_CLIENT_SECRET = "CECI EST UN SUPER SECRET"

/// L'ID de votre abonnement Azure trouvable sur l'onglet abonnement de votre compte Azure
AZURE_SUBSCRIPTION_ID = "VOTRE ID D'ABONNEMENT ICI"
```

Vous pouvez ensuite lancer le projet en ouvrant le terminal dans le projet avec la commande suivante :

```
node index.js
```

Par défaut, le projet se lancera sur le port 3000, s'il est déjà occupé il se lancera sur un autre port disponible, si c'est le cas le terminal précisera lequel.

## Le projet lancé :

Vous arrivez donc sur la page de connexion, trois utilisateurs sont créés par défaut par l'application pour pouvoir tester

### Le premier utilisateur, il n'a accès a aucune VM 
identifiant: user1
mot de passe: password1
### Le second utilisateur, il n'a accès qu'à une VM
identifiant: user2
mot de passe: password2
### Le troisième utilisateur, il a accès à trois VM (Vous ne pouvez lancer qu'une VM à la fois)
identifiant: user3
mot de passe: password3



