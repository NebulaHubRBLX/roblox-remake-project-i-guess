const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('username').innerText = user.displayName;
        const fetchChat = db.ref("messages/");
        fetchChat.on("child_added", (snapshot) => {
            const messages = snapshot.val();
            const msg = "<li>" + messages.usr + ": " + messages.msg + "</li>";
            document.getElementById("messages").innerHTML += msg;
            document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
        });
    } else {
        document.getElementById('auth-buttons').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
    }
});
document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'block';
});
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('login-modal').style.display = 'none';
        })
        .catch((error) => {
            alert(error.message);
        });
});
document.getElementById('signup-btn').addEventListener('click', () => {
    document.getElementById('signup-modal').style.display = 'block';
});
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => {
            return cred.user.updateProfile({
                displayName: username
            });
        })
        .then(() => {
            document.getElementById('signup-modal').style.display = 'none';
        })
        .catch((error) => {
            alert(error.message);
        });
});
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
});
document.getElementById('send-message').addEventListener('submit', (e) => {
    e.preventDefault();
    const timestamp = Date.now();
    const chatTxt = document.getElementById('chat-txt');
    const message = chatTxt.value;
    chatTxt.value = '';
    const user = auth.currentUser;
    if (user) {
        db.ref("messages/" + timestamp).set({
            usr: user.displayName,
            msg: message,
        });
    } else {
        alert('Please log in to chat.');
    }
});
