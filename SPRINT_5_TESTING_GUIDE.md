# Sprint 5 - Guide de Test Complet Edu4All

## 🎯 **Fonctionnalités Implémentées**

### ✅ **1. Chat Temps Réel avec Socket.IO**

- ✅ Chat général accessible depuis le dashboard
- ✅ Chat intégré dans les pages de cours
- ✅ Historique des 50 derniers messages
- ✅ Indication "utilisateur en train d'écrire"
- ✅ Liste des utilisateurs connectés
- ✅ Sauvegarde des messages dans MongoDB
- ✅ Authentification Socket.IO avec JWT

### ✅ **2. Système de Wallet**

- ✅ Solde stocké en base de données
- ✅ API REST complète
- ✅ Sécurité backend
- ✅ Affichage du solde dans le dashboard

### ✅ **3. Recharge Stripe/PayPal**

- ✅ Page de recharge avec choix de paiement
- ✅ Intégration Stripe complète
- ✅ Intégration PayPal complète
- ✅ Ajout automatique au solde après paiement
- ✅ Gestion des erreurs

### ✅ **4. Achat de Cours PDF**

- ✅ Vérification du solde avant achat
- ✅ Achat avec wallet
- ✅ Accès sécurisé aux fichiers
- ✅ Sauvegarde des achats

---

## 🚀 **Guide de Test**

### **Prérequis**

1. Backend démarré sur `http://localhost:5000`
2. Frontend démarré sur `http://localhost:3000`
3. MongoDB connecté
4. Comptes Stripe/PayPal configurés

---

## 📋 **Tests par Fonctionnalité**

### **Test 1: Chat Temps Réel**

#### **1.1 Chat Général**

1. **Login** avec un utilisateur
2. **Aller au dashboard** → Section "Chat"
3. **Ouvrir le chat** → Cliquer sur "Ouvrir le chat complet"
4. **Tester l'envoi de messages**
5. **Vérifier en temps réel** avec un autre utilisateur

#### **1.2 Chat de Cours**

1. **Aller sur une page de cours**
2. **Cliquer sur le bouton chat** (💬 en bas à droite)
3. **Tester l'envoi de messages** dans le chat du cours
4. **Vérifier que les messages** sont spécifiques au cours

#### **1.3 Fonctionnalités Avancées**

- ✅ **Indication de frappe** : Voir "X est en train d'écrire"
- ✅ **Liste des utilisateurs** : Voir qui est connecté
- ✅ **Historique** : Voir les 50 derniers messages
- ✅ **Authentification** : Seuls les utilisateurs connectés peuvent chatter

### **Test 2: Système de Wallet**

#### **2.1 Affichage du Solde**

1. **Login** avec un utilisateur
2. **Aller au dashboard** → Section "Mon Wallet"
3. **Vérifier l'affichage** du solde actuel
4. **Cliquer sur "Voir détails"** → Aller à la page wallet complète

#### **2.2 Historique des Transactions**

1. **Aller à `/wallet`**
2. **Vérifier l'historique** des transactions
3. **Vérifier les détails** : montant, type, date, méthode de paiement

### **Test 3: Recharge Wallet**

#### **3.1 Recharge Stripe**

1. **Aller à `/wallet`**
2. **Cliquer sur "Recharger"**
3. **Entrer un montant** (ex: 10€)
4. **Choisir "Carte bancaire"**
5. **Utiliser les cartes de test Stripe** :
   - ✅ **Succès** : `4242 4242 4242 4242`
   - ❌ **Échec** : `4000 0000 0000 0002`
6. **Vérifier que le solde** est mis à jour
7. **Vérifier la transaction** dans l'historique

#### **3.2 Recharge PayPal**

1. **Dans la modal de recharge**
2. **Cliquer sur le bouton PayPal**
3. **Utiliser un compte PayPal sandbox**
4. **Compléter le paiement**
5. **Vérifier que le solde** est mis à jour

### **Test 4: Achat de Cours PDF**

#### **4.1 Achat avec Solde Suffisant**

1. **Aller sur un cours payant**
2. **Vérifier l'affichage** du prix et du solde
3. **Cliquer sur "Acheter ce cours"**
4. **Confirmer l'achat**
5. **Vérifier que le bouton** devient "Télécharger le cours"
6. **Télécharger le fichier PDF**

#### **4.2 Achat avec Solde Insuffisant**

1. **Aller sur un cours** plus cher que le solde
2. **Vérifier que le bouton** affiche "Solde insuffisant"
3. **Cliquer sur "Recharger mon wallet"**
4. **Recharger le wallet**
5. **Retourner au cours** et acheter

#### **4.3 Accès aux Fichiers Achetés**

1. **Après achat d'un cours**
2. **Aller sur la page du cours**
3. **Vérifier l'accès** aux fichiers PDF
4. **Tester le téléchargement**

---

## 🔧 **Tests Techniques**

### **Test 1: API Endpoints**

#### **Wallet API**

```bash
# GET /api/wallet
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/wallet

# GET /api/wallet/transactions
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/wallet/transactions
```

#### **Payment API**

```bash
# POST /api/payments/stripe/create-payment-intent
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"amount": 10}' http://localhost:5000/api/payments/stripe/create-payment-intent
```

#### **Purchase API**

```bash
# POST /api/wallet/purchase
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"courseId": "course_id", "amount": 25}' http://localhost:5000/api/wallet/purchase
```

### **Test 2: Socket.IO Connection**

```javascript
// Dans la console du navigateur
const socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("token") },
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO");
});

socket.emit("sendMessage", {
  content: "Test message",
  room: "general",
});
```

---

## 🐛 **Dépannage**

### **Problème: Chat ne fonctionne pas**

**Solution:**

1. Vérifier que Socket.IO est connecté
2. Vérifier l'authentification JWT
3. Vérifier la connexion MongoDB

### **Problème: Paiements échouent**

**Solution:**

1. Vérifier les clés Stripe/PayPal
2. Vérifier les variables d'environnement
3. Vérifier les logs backend

### **Problème: Wallet ne se met pas à jour**

**Solution:**

1. Vérifier la connexion MongoDB
2. Vérifier les logs de transaction
3. Vérifier l'authentification

---

## 📊 **Métriques de Test**

### **Performance**

- ✅ **Temps de réponse API** < 500ms
- ✅ **Connexion Socket.IO** < 2s
- ✅ **Envoi de messages** < 100ms

### **Sécurité**

- ✅ **Authentification JWT** obligatoire
- ✅ **Validation des montants** côté backend
- ✅ **Protection CSRF** activée

### **UX**

- ✅ **Interface responsive** sur mobile/desktop
- ✅ **Feedback utilisateur** pour toutes les actions
- ✅ **Gestion d'erreurs** claire

---

## 🎉 **Validation Finale**

### **Checklist Sprint 5**

- [ ] Chat temps réel fonctionnel
- [ ] Wallet avec recharge Stripe/PayPal
- [ ] Achat de cours PDF
- [ ] Interface responsive
- [ ] Sécurité implémentée
- [ ] Tests passés
- [ ] Documentation complète

**🎯 Sprint 5 - TERMINÉ !** 🚀
