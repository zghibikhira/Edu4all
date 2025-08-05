# Guide de Test - Système de Chat Socket.IO Amélioré

## 🎯 Fonctionnalités Implémentées

### 1. **Backend Socket.IO**

- ✅ Authentification JWT pour sécuriser les connexions
- ✅ Gestion des rooms (général, cours, messages privés)
- ✅ Sauvegarde des messages dans MongoDB
- ✅ Indicateurs de frappe en temps réel
- ✅ Gestion de la présence des utilisateurs
- ✅ Édition et suppression de messages
- ✅ Marquage des messages comme lus

### 2. **Frontend React**

- ✅ Interface de chat moderne et responsive
- ✅ Auto-scroll vers les derniers messages
- ✅ Indicateurs "utilisateur en train d'écrire..."
- ✅ Liste des utilisateurs connectés
- ✅ Notifications en temps réel
- ✅ Édition et suppression de messages
- ✅ Historique des messages avec pagination

### 3. **Fonctionnalités Avancées**

- ✅ Messages privés entre utilisateurs
- ✅ Chat contextuel par cours
- ✅ Résumé des messages récents sur le dashboard
- ✅ Compteur de messages non lus
- ✅ Gestion des erreurs et reconnexion

---

## 🚀 Installation et Configuration

### 1. **Dépendances Backend**

```bash
cd backend
npm install socket.io mongoose
```

### 2. **Dépendances Frontend**

```bash
cd frontend
npm install socket.io-client
```

### 3. **Variables d'environnement**

Assurez-vous que votre fichier `.env` contient :

```env
JWT_SECRET=your-jwt-secret
MONGO_URI=mongodb://localhost:27017/edu4all
```

---

## 🧪 Tests à Effectuer

### **Test 1 : Connexion et Authentification**

1. Connectez-vous avec un utilisateur
2. Allez sur `/chat`
3. Vérifiez que la connexion Socket.IO s'établit
4. Vérifiez que vous apparaissez dans la liste des utilisateurs connectés

### **Test 2 : Chat Général**

1. Ouvrez deux fenêtres de navigateur
2. Connectez-vous avec deux utilisateurs différents
3. Allez sur `/chat` dans les deux fenêtres
4. Envoyez des messages et vérifiez qu'ils apparaissent en temps réel

### **Test 3 : Indicateurs de Frappe**

1. Dans une fenêtre, commencez à taper dans le champ de message
2. Vérifiez que l'autre utilisateur voit "X écrit..."
3. Arrêtez de taper et vérifiez que l'indicateur disparaît

### **Test 4 : Chat Contextuel par Cours**

1. Allez sur la page d'un cours
2. Utilisez le composant Chat avec `courseId`
3. Vérifiez que les messages sont filtrés par cours
4. Testez l'historique spécifique au cours

### **Test 5 : Messages Privés**

1. Utilisez le composant Chat avec `receiverId`
2. Vérifiez que seuls les deux utilisateurs voient les messages
3. Testez l'historique des messages privés

### **Test 6 : Édition et Suppression**

1. Envoyez un message
2. Cliquez sur "Modifier" et changez le contenu
3. Vérifiez que le message est mis à jour en temps réel
4. Cliquez sur "Supprimer" et confirmez
5. Vérifiez que le message disparaît

### **Test 7 : Auto-scroll**

1. Envoyez plusieurs messages
2. Vérifiez que la vue défile automatiquement vers le bas
3. Testez avec de longs messages

### **Test 8 : Dashboard - Résumé des Messages**

1. Allez sur le dashboard
2. Vérifiez que le composant `ChatSummary` affiche les messages récents
3. Vérifiez le compteur de messages non lus
4. Cliquez sur "Ouvrir le chat complet"

### **Test 9 : Notifications**

1. Envoyez un message depuis une fenêtre
2. Vérifiez que l'autre utilisateur reçoit une notification
3. Testez les notifications d'arrivée/départ d'utilisateurs

### **Test 10 : Gestion des Erreurs**

1. Déconnectez le serveur backend
2. Vérifiez que le frontend affiche une erreur de connexion
3. Redémarrez le serveur
4. Vérifiez que la reconnexion se fait automatiquement

---

## 📊 Endpoints API

### **Messages**

- `GET /api/messages/recent` - Messages récents pour le dashboard
- `GET /api/messages/room/:room` - Messages d'une room
- `GET /api/messages/direct/:receiverId` - Messages directs
- `GET /api/messages/course/:courseId` - Messages d'un cours
- `POST /api/messages/mark-read` - Marquer comme lus
- `DELETE /api/messages/:messageId` - Supprimer un message
- `PUT /api/messages/:messageId` - Modifier un message

---

## 🔧 Événements Socket.IO

### **Événements Client → Serveur**

- `joinRoom` - Rejoindre une room
- `joinDirectMessage` - Rejoindre un chat privé
- `sendMessage` - Envoyer un message
- `typing` - Indiquer qu'on écrit
- `stopTyping` - Arrêter l'indicateur de frappe
- `editMessage` - Modifier un message
- `deleteMessage` - Supprimer un message
- `markAsRead` - Marquer comme lu

### **Événements Serveur → Client**

- `messageHistory` - Historique des messages
- `newMessage` - Nouveau message
- `messageEdited` - Message modifié
- `messageDeleted` - Message supprimé
- `userList` - Liste des utilisateurs connectés
- `userJoined` - Utilisateur rejoint
- `userLeft` - Utilisateur quitté
- `userTyping` - Utilisateur écrit
- `userStoppedTyping` - Utilisateur arrête d'écrire
- `notification` - Notification
- `messageError` - Erreur de message

---

## 🎨 Utilisation des Composants

### **Chat Général**

```jsx
<Chat />
```

### **Chat de Cours**

```jsx
<Chat courseId="courseId" />
```

### **Messages Privés**

```jsx
<Chat receiverId="userId" />
```

### **Chat avec Room Personnalisée**

```jsx
<Chat room="custom-room" />
```

### **Résumé sur Dashboard**

```jsx
<ChatSummary />
```

---

## 🐛 Dépannage

### **Erreur de connexion Socket.IO**

- Vérifiez que le serveur backend fonctionne
- Vérifiez que le token JWT est valide
- Regardez les logs du serveur pour les erreurs d'authentification

### **Messages ne s'affichent pas**

- Vérifiez la connexion MongoDB
- Regardez les logs pour les erreurs de sauvegarde
- Vérifiez que les utilisateurs sont bien authentifiés

### **Indicateurs de frappe ne fonctionnent pas**

- Vérifiez que les événements `typing` et `stopTyping` sont émis
- Regardez les timeouts dans le code frontend

### **Auto-scroll ne fonctionne pas**

- Vérifiez que `messagesEndRef` est bien configuré
- Assurez-vous que les messages sont bien ajoutés au state

---

## 📝 Notes Importantes

1. **Sécurité** : Toutes les connexions Socket.IO sont authentifiées avec JWT
2. **Performance** : Les messages sont paginés (50 par défaut)
3. **Base de données** : Les messages sont sauvegardés dans MongoDB
4. **Rooms** : Support des rooms générales, par cours et messages privés
5. **Temps réel** : Tous les événements sont synchronisés en temps réel

---

## 🎉 Félicitations !

Votre système de chat est maintenant complet avec :

- ✅ Chat temps réel avec Socket.IO
- ✅ Authentification JWT sécurisée
- ✅ Sauvegarde MongoDB
- ✅ Indicateurs de frappe
- ✅ Auto-scroll
- ✅ Édition/suppression de messages
- ✅ Messages privés et contextuels
- ✅ Interface moderne et responsive
