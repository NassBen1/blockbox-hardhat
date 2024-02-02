// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedSocialNetwork {
    address[] public userAddresses; // Déclaration du tableau pour stocker les adresses des utilisateurs
    // Structure pour représenter un utilisateur

    struct User {
        uint256 userId;
        string username;
        string bio; // Ajout d'une bio pour l'utilisateur
        address userAddress;
        uint256[] postIds; // Liste des identifiants de posts de l'utilisateur
        mapping(uint256 => Comment[]) postComments;
        mapping(address => bool) followers;
        address[] followersList; // Liste des followers
        mapping(address => bool) following;
        bool registered;
        uint256 followerCount; // Nombre de followers
        uint256 totalDirectMessages; // Ajout d'un champ pour suivre le nombre total de messages directs
        mapping(address => mapping(uint256 => string)) directMessages;
        mapping(address => mapping(uint256 => uint256)) messageTimestamps;
    }

    struct DirectMessage {
    string content;
    address sender;
    address receiver;
    uint256 timestamp;
    }

    mapping(address => mapping(address => DirectMessage[])) private directMessages;

    // Structure pour représenter un post
    struct Post {
        uint256 postId;
        string content;
        address author;
        uint256 likeCount; // Nombre de likes du post
        mapping(address => bool) likes; // Tableau des utilisateurs qui ont aimé le post
    }

    // Structure pour représenter un commentaire
    struct Comment {
        uint256 commentId;
        string content;
        address author;
        string username; // Nom d'utilisateur de l'auteur
    }

    // Stocke les utilisateurs enregistrés sur la plateforme
    mapping(address => User) public users;

    // Stocke tous les posts sur la blockchain
    mapping(uint256 => Post) public allPosts;
    mapping(string => bool) private uniqueUsernames;
    uint256 public postCount;

    // Événement déclenché lorsqu'un nouvel utilisateur rejoint la plateforme
    event NewUserRegistered(address indexed userAddress, string username, string bio);

    // Événement déclenché lorsqu'un utilisateur publie un nouveau post
    event NewPostCreated(uint256 indexed postId, address indexed author, string content);

    // Événement déclenché lorsqu'un utilisateur commente un post
    event NewComment(uint256 indexed postId, uint256 indexed commentId, address indexed author, string content);

    // Événement déclenché lorsqu'un utilisateur envoie un message direct
    event DirectMessageSent(address indexed sender, address indexed receiver, string content);

    // Événement déclenché lorsqu'un utilisateur aime un post
    event PostLiked(uint256 indexed postId, address indexed liker);

    // Événement déclenché lorsqu'un utilisateur annule son like sur un post
    event PostUnliked(uint256 indexed postId, address indexed unliker);


    // Événement déclenché lorsqu'un utilisateur commence à suivre un autre utilisateur
    event NewFollower(address indexed follower, address indexed user);

    // Fonction pour enregistrer un nouvel utilisateur
    function registerUser(string memory _username, string memory _bio) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(users[msg.sender].username).length == 0, "User already registered");

        // Vérifier si le nom d'utilisateur est déjà pris
        for (uint256 i = 0; i < userAddresses.length; i++) {
            require(keccak256(bytes(users[userAddresses[i]].username)) != keccak256(bytes(_username)), "Username already exists");
        }

        User storage newUser = users[msg.sender];
        newUser.userId = block.timestamp; // Utilisez une méthode plus robuste pour générer l'ID
        newUser.username = _username;
        newUser.bio = _bio; // Enregistrement de la bio de l'utilisateur
        newUser.userAddress = msg.sender;
        newUser.registered = true;

        userAddresses.push(msg.sender); // Ajouter l'adresse de l'utilisateur à la liste des adresses

        emit NewUserRegistered(msg.sender, _username, _bio);
    }

    // Fonction pour vérifier si un utilisateur est déjà enregistré
    function isRegistered() public view returns (bool) {
        return users[msg.sender].registered;
    }

    // Fonction pour récupérer tous les posts
    function getAllPosts() public view returns (uint256[] memory, string[] memory, string[] memory, uint256[] memory) {
        uint256[] memory postIds = new uint256[](postCount);
        string[] memory contents = new string[](postCount);
        string[] memory authors = new string[](postCount);
        uint256[] memory likeCounts = new uint256[](postCount);

        for (uint256 i = 1; i <= postCount; i++) {
            postIds[i - 1] = allPosts[i].postId;
            contents[i - 1] = allPosts[i].content;
            // Modifiez cette ligne pour récupérer le username
            authors[i - 1] = users[allPosts[i].author].username;
            likeCounts[i - 1] = allPosts[i].likeCount;
        }

        return (postIds, contents, authors, likeCounts);
    }

    // Fonction pour retourner les propriétés de l'utilisateur actuel
    function getCurrentUser() public view returns (
        uint256 userId,
        string memory username,
        string memory bio,
        address userAddress,
        uint256[] memory postIds,
        address[] memory followersList,
        uint256 followerCount
    ) {
        User storage currentUser = users[msg.sender];
        return (
            currentUser.userId,
            currentUser.username,
            currentUser.bio,
            currentUser.userAddress,
            currentUser.postIds,
            currentUser.followersList,
            currentUser.followerCount
        );
    }

    // Fonction pour récupérer les informations d'un utilisateur à partir de son nom d'utilisateur
    function getUserByUsername(string memory _username) public view returns (
        uint256 userId,
        string memory username,
        string memory bio,
        address userAddress,
        uint256[] memory postIds,
        address[] memory followersList,
        uint256 followerCount
    ) {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            if (keccak256(bytes(users[currentUserAddress].username)) == keccak256(bytes(_username))) {
                User storage currentUser = users[currentUserAddress];
                return (
                    currentUser.userId,
                    currentUser.username,
                    currentUser.bio,
                    currentUser.userAddress,
                    currentUser.postIds,
                    currentUser.followersList,
                    currentUser.followerCount
                );
            }
        }

        revert("User not found");
    }

    // Fonction pour qu'un utilisateur publie un nouveau post
    function createPost(string memory _content) public {
        require(bytes(_content).length > 0, "Post content cannot be empty");
        require(users[msg.sender].userAddress != address(0), "User not registered");

        uint256 newPostId = postCount + 1;

        // Stocker les informations dans des variables temporaires
        address author = msg.sender;

        // Associer le post à l'utilisateur
        users[author].postIds.push(newPostId);

        // Stocker la structure Post dans le mapping allPosts
        allPosts[newPostId].postId = newPostId;
        allPosts[newPostId].content = _content;
        allPosts[newPostId].author = author;
        allPosts[newPostId].likeCount = 0;

        // Incrémenter le nombre total de posts
        postCount++;

        emit NewPostCreated(newPostId, author, _content);
    }

    // Fonction pour qu'un utilisateur aime un post
    function likePost(uint256 _postId) public {
        require(allPosts[_postId].postId != 0, "Post does not exist");
        require(!allPosts[_postId].likes[msg.sender], "Already liked");

        // Incrémente le compteur de likes
        allPosts[_postId].likeCount++;

        // Enregistre l'utilisateur comme ayant aimé ce post
        allPosts[_postId].likes[msg.sender] = true;

        emit PostLiked(_postId, msg.sender);
    }

    // Fonction pour qu'un utilisateur annule son like sur un post
    function unlikePost(uint256 _postId) public {
        require(allPosts[_postId].postId != 0, "Post does not exist");
        require(allPosts[_postId].likes[msg.sender], "Not liked yet");

        // Décrémente le compteur de likes
        allPosts[_postId].likeCount--;

        // Supprime l'enregistrement du like pour cet utilisateur
        delete allPosts[_postId].likes[msg.sender];

        emit PostUnliked(_postId, msg.sender);
    }

    // Fonction pour récupérer les commentaires d'un post avec les noms d'utilisateur des commentateurs
    function getPostCommentsWithUsernames(uint256 _postId) public view returns (string[] memory, string[] memory) {
        uint256 commentCount = users[allPosts[_postId].author].postComments[_postId].length;
        string[] memory comments = new string[](commentCount);
        string[] memory usernames = new string[](commentCount);

        for (uint256 i = 0; i < commentCount; i++) {
            comments[i] = users[allPosts[_postId].author].postComments[_postId][i].content;
            usernames[i] = users[allPosts[_postId].author].postComments[_postId][i].username;
        }

        return (comments, usernames);
    }

    // Fonction pour changer la bio d'un utilisateur
    function changeBio(string memory _newBio) public {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        users[msg.sender].bio = _newBio;
    }

    // Fonction pour qu'un utilisateur commente un post
    function commentOnPost(uint256 _postId, string memory _content, string memory _username) public {
        require(bytes(_content).length > 0, "Comment content cannot be empty");
        require(allPosts[_postId].postId != 0, "Post does not exist");

        uint256 newCommentId = users[msg.sender].postComments[_postId].length + 1;
        Comment storage newComment = users[msg.sender].postComments[_postId].push();
        newComment.commentId = newCommentId;
        newComment.content = _content;
        newComment.username = _username; // Stocker le nom d'utilisateur
        newComment.author = msg.sender;

        emit NewComment(_postId, newCommentId, msg.sender, _content);
    }

    function getUserAddressByUsername(string memory _username) public view returns (address) {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            if (keccak256(bytes(users[currentUserAddress].username)) == keccak256(bytes(_username))) {
                return currentUserAddress;
            }
        }
        revert("User not found");
    }

 // Fonction pour envoyer un message direct en utilisant le nom d'utilisateur du destinataire
// Modifiez la fonction pour stocker les messages avec les informations appropriées
function sendMessageDirectlyByUsername(string memory _receiverUsername, string memory _content) public {
    // Vérifie si le contenu du message est vide
    require(bytes(_content).length > 0, "Message content cannot be empty");
    // Vérifie si l'utilisateur est enregistré
    require(users[msg.sender].userAddress != address(0), "User not registered");

    // Obtient l'adresse du destinataire à partir de son nom d'utilisateur
    address receiverAddress = getUserAddressByUsername(_receiverUsername);

    // Vérifie si le destinataire existe
    require(receiverAddress != address(0), "Receiver not found");

    // Enregistre le message direct avec les informations nécessaires
    DirectMessage memory newMessage = DirectMessage({
        content: _content,
        sender: msg.sender,
        receiver: receiverAddress,
        timestamp: block.timestamp
    });

    // Stocke le message dans le mapping
    directMessages[msg.sender][receiverAddress].push(newMessage);
    directMessages[receiverAddress][msg.sender].push(newMessage);

    // Ajoute le username du destinataire dans le tableau des usernames uniques
    uniqueUsernames[_receiverUsername] = true;

    // Ajoute également votre username dans le tableau des usernames uniques pour inclure les messages reçus
    uniqueUsernames[users[msg.sender].username] = true;

    // Émet l'événement du message direct envoyé
    emit DirectMessageSent(msg.sender, receiverAddress, _content);
}

    // Fonction pour récupérer les usernames des utilisateurs avec qui vous avez échangé des messages
    function getAllMessagedUsernames() public view returns (string[] memory) {
        // Crée un tableau pour stocker les usernames
        string[] memory messagedUsernames = new string[](userAddresses.length);
        uint256 count = 0;

        // Parcourt tous les usernames uniques
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            string memory currentUserUsername = users[currentUserAddress].username;

            // Vérifie si le username est unique et si ce n'est pas le vôtre
            if (uniqueUsernames[currentUserUsername] && keccak256(bytes(currentUserUsername)) != keccak256(bytes(users[msg.sender].username))) {
                messagedUsernames[count] = currentUserUsername;
                count++;
            }
        }

        // Réduit la taille du tableau à la taille correcte
        assembly {
            mstore(messagedUsernames, count)
        }

        return messagedUsernames;
    }


    // Fonction pour qu'un utilisateur commence à suivre un autre utilisateur à partir du nom d'utilisateur
    function followUser(string memory _usernameToFollow) public {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        require(bytes(_usernameToFollow).length > 0, "Username cannot be empty");
        require(keccak256(bytes(users[msg.sender].username)) != keccak256(bytes(_usernameToFollow)), "Cannot follow yourself");

        // Vérifie si l'utilisateur à suivre existe
        address userToFollowAddress;

        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            if (keccak256(bytes(users[currentUserAddress].username)) == keccak256(bytes(_usernameToFollow))) {
                userToFollowAddress = currentUserAddress;
                break;
            }
        }

        require(userToFollowAddress != address(0), "User to follow not registered");
        require(!users[msg.sender].following[userToFollowAddress], "Already following");

        // Met à jour la liste des followers
        users[userToFollowAddress].followersList.push(msg.sender);
        users[userToFollowAddress].followerCount++;

        // Marque l'utilisateur comme suivi
        users[msg.sender].following[userToFollowAddress] = true;

        emit NewFollower(msg.sender, userToFollowAddress);
    }

    // Fonction pour qu'un utilisateur arrête de suivre un autre utilisateur à partir du nom d'utilisateur
    function unfollowUser(string memory _usernameToUnfollow) public {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        require(bytes(_usernameToUnfollow).length > 0, "Username cannot be empty");

        // Vérifie si l'utilisateur à ne plus suivre existe
        address userToUnfollowAddress;

        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            if (keccak256(bytes(users[currentUserAddress].username)) == keccak256(bytes(_usernameToUnfollow))) {
                userToUnfollowAddress = currentUserAddress;
                break;
            }
        }

        require(userToUnfollowAddress != address(0), "User to unfollow not registered");
        require(users[msg.sender].following[userToUnfollowAddress], "Not following");

        // Supprime l'utilisateur de la liste des followers
        address[] storage followersList = users[userToUnfollowAddress].followersList;
        for (uint256 i = 0; i < followersList.length; i++) {
            if (followersList[i] == msg.sender) {
                followersList[i] = followersList[followersList.length - 1];
                followersList.pop();
                break;
            }
        }

        // Décrémente le compteur de followers
        users[userToUnfollowAddress].followerCount--;

        // Marque l'utilisateur comme non suivi
        users[msg.sender].following[userToUnfollowAddress] = false;
    }

    function getPostCountByUsername(string memory _username) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= postCount; i++) {
            if (keccak256(bytes(users[allPosts[i].author].username)) == keccak256(bytes(_username))) {
                count++;
            }
        }
        return count;
    }

function getAllMessagesWithUser(string memory _username) public view returns (string[] memory, string[] memory, string[] memory, uint256[] memory) {

    // Obtenir l'adresse de l'utilisateur cible à partir du nom d'utilisateur
    address targetAddress = getUserAddressByUsername(_username);

    // Créer des tableaux pour stocker les informations
    string[] memory senders = new string[](directMessages[msg.sender][targetAddress].length);
    string[] memory receivers = new string[](directMessages[msg.sender][targetAddress].length);
    string[] memory messages = new string[](directMessages[msg.sender][targetAddress].length);
    uint256[] memory timestamps = new uint256[](directMessages[msg.sender][targetAddress].length);

    // Parcourir les messages entre l'utilisateur actuel et l'utilisateur cible
    for (uint256 i = 0; i < directMessages[msg.sender][targetAddress].length; i++) {
        DirectMessage memory message = directMessages[msg.sender][targetAddress][i];

        senders[i] = users[message.sender].username;
        receivers[i] = users[message.receiver].username;
        messages[i] = message.content;
        timestamps[i] = message.timestamp;
    }

    return (senders, receivers, messages, timestamps);
}


    function isFollowing(string memory _usernameToCheck) public view returns (bool) {
        require(users[msg.sender].userAddress != address(0), "User not registered");

        address userToCheckAddress;

        // Parcourir la liste des utilisateurs pour trouver l'adresse correspondant au nom d'utilisateur
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            if (keccak256(bytes(users[currentUserAddress].username)) == keccak256(bytes(_usernameToCheck))) {
                userToCheckAddress = currentUserAddress;
                break;
            }
        }

        require(userToCheckAddress != address(0), "User to check not registered");

        // Vérifie si l'utilisateur actuel suit l'utilisateur à vérifier
        return users[msg.sender].following[userToCheckAddress];
    }

    // Fonction pour récupérer le nombre de followers d'un utilisateur
    function getFollowerCount(address _userAddress) public view returns (uint256) {
        return users[_userAddress].followerCount;
    }

        // Fonction pour récupérer le nombre de followers d'un utilisateur par son nom d'utilisateur
    function getFollowerCountByUsername(string memory _username) public view returns (uint256) {
        for (uint256 i = 0; i < userAddresses.length; i++) {
            address currentUserAddress = userAddresses[i];
            if (keccak256(bytes(users[currentUserAddress].username)) == keccak256(bytes(_username))) {
                return users[currentUserAddress].followerCount;
            }
        }

        revert("User not found");
    }

    // Fonction pour récupérer la liste des followers d'un utilisateur
    function getFollowers(address _userAddress) public view returns (address[] memory) {
        return users[_userAddress].followersList;
    }

// Fonction pour rechercher les posts contenant une chaîne de caractères
    function searchPostsByContent(string memory _searchString) public view returns (uint256[] memory, string[] memory, string[] memory, uint256[] memory) {
        uint256[] memory matchingPostIds = new uint256[](postCount);
        uint256 matchingCount = 0;

        for (uint256 i = 1; i <= postCount; i++) {
            string memory content = allPosts[i].content;

            if (containsIgnoreCase(content, _searchString)) {
                matchingPostIds[matchingCount] = allPosts[i].postId;
                matchingCount++;
            }
        }

        // Réduit la taille du tableau à la taille correcte
        assembly {
            mstore(matchingPostIds, matchingCount)
        }

        return getPostDetails(matchingPostIds);
    }

    // Fonction pour rechercher les usernames contenant un mot
    function searchUsernamesByWord(string memory _searchWord) public view returns (string[] memory) {
        string[] memory matchingUsernames = new string[](userAddresses.length);
        uint256 matchingCount = 0;

        for (uint256 i = 0; i < userAddresses.length; i++) {
            string memory username = users[userAddresses[i]].username;

            if (containsIgnoreCase(username, _searchWord)) {
                matchingUsernames[matchingCount] = username;
                matchingCount++;
            }
        }

        // Réduit la taille du tableau à la taille correcte
        assembly {
            mstore(matchingUsernames, matchingCount)
        }

        return matchingUsernames;
    }

    // Fonction utilitaire pour vérifier si une chaîne de caractères contient une sous-chaîne (insensible à la casse)
    function containsIgnoreCase(string memory _string, string memory _substring) internal pure returns (bool) {
        return (bytes(_string).length >= bytes(_substring).length) &&
            (keccak256(abi.encodePacked(_string)) == keccak256(abi.encodePacked(_substring)));
    }

    // Fonction utilitaire pour récupérer les détails des posts
    function getPostDetails(uint256[] memory _postIds) internal view returns (uint256[] memory, string[] memory, string[] memory, uint256[] memory) {
        uint256[] memory postIds = new uint256[](_postIds.length);
        string[] memory contents = new string[](_postIds.length);
        string[] memory authors = new string[](_postIds.length);
        uint256[] memory likeCounts = new uint256[](_postIds.length);

        for (uint256 i = 0; i < _postIds.length; i++) {
            postIds[i] = allPosts[_postIds[i]].postId;
            contents[i] = allPosts[_postIds[i]].content;
            authors[i] = users[allPosts[_postIds[i]].author].username;
            likeCounts[i] = allPosts[_postIds[i]].likeCount;
        }

        return (postIds, contents, authors, likeCounts);
    }
    
}
