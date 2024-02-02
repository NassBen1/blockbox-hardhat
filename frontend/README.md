# Réseau Social Décentralisé BlockBox

Ce projet introduit BlockBox, une plateforme révolutionnaire de réseau social décentralisé, construite sur la robuste infrastructure de la blockchain Ethereum en utilisant Solidity pour élaborer le contrat intelligent au cœur du système. BlockBox redéfinit les interactions sociales en ligne en permettant aux utilisateurs de s'enregistrer, de publier des messages, de commenter les contributions des autres, et de tisser des liens en suivant les profils. Un aspect distinctif de BlockBox est le maintien de l'anonymat des utilisateurs, qui sont reconnus sur la plateforme par des pseudonymes, offrant ainsi une couche supplémentaire de confidentialité.


1. Lien vidéo :https://drive.google.com/file/d/1-9igRS4dSlmhXm2QBI470G56WqzwleJk/view?usp=drive_link
## Caractéristiques
- **Inscription d'utilisateurs** : Les utilisateurs peuvent s'inscrire avec un nom d'utilisateur et une bio.
- **Gestion de posts** : Les utilisateurs peuvent créer des posts, les commenter, et les liker.
- **Système de followers** : Les utilisateurs peuvent suivre et se désabonner d'autres utilisateurs.
- **Messages directs** : Envoi de messages directs entre utilisateurs.
- **Comptage de followers et de likes** : Le contrat stocke et permet de récupérer le nombre de followers d'un utilisateur ainsi que le nombre de likes d'un post.

## Technologies
- **Solidity** : Langage de programmation pour écrire les contrats intelligents.
- **Ethereum Blockchain** : Plateforme choisie pour déployer le contrat intelligent.
- **Clerk** : Plateforme de gestion d'utilisateurs et d'authentification
- **Node.js & npm** : Nécessaires pour la mise en place de notre environnement de développement
- **Hardhat** : Hardhat est un environnement de développement Ethereum qui facilite la création, le test, et le débogage de contrats intelligents.

Pour utiliser ce projet, vous devez avoir Node.js et npm installés sur votre machine.

1. Clonez le dépôt :
   ```
   git clone 
   <lien>
   ```
2. Installez les dépendances :
   ```
   npm install
   ```
3. Compilez et déployez le contrat intelligent sur un réseau de test (par exemple, Ganache) :
   ```
   Demande à Nassim la commande
   ```

## Exemples de Fonctions
- **Inscription d'un nouvel utilisateur** :
  ```
  registerUser("nomUtilisateur", "Ceci est une bio.");
  ```
- **Création d'un post** :
  ```
  createPost("Ceci est le contenu de mon post.");
  ```
- **Suivre un utilisateur** :
  ```
  followUser("nomUtilisateurASuivre");
  ```

