const firebaseConfig = {
  apiKey: "AIzaSyCvDI5eqVAp_dd-g27epu_qpIfp6tdkrLw",
  authDomain: "roblox2015-2c465.firebaseapp.com",
  projectId: "roblox2015-2c465",
  storageBucket: "roblox2015-2c465.firebasestorage.app",
  messagingSenderId: "470879880059",
  appId: "1:470879880059:web:b686825b83157ecfd133de",
  measurementId: "G-93LDFMKMSJ"
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
async function fetchPopularGames() {
    const sortsResponse = await fetch('https://games.roblox.com/v1/games/sorts?gameSortsContext=GamesDefaultSorts');
    const sortsData = await sortsResponse.json();
    const popularToken = sortsData.sorts.find(sort => sort.name === 'Popular').token;
    const gamesResponse = await fetch(`https://games.roblox.com/v1/games?sortToken=${popularToken}&limit=10`);
    const gamesData = await gamesResponse.json();
    const placeIds = gamesData.games.map(game => game.rootPlaceId).join(',');
    const thumbsResponse = await fetch(`https://thumbnails.roblox.com/v1/places/icons?placeIds=${placeIds}&size=150x150&format=Png&isCircular=false`);
    const thumbsData = await thumbsResponse.json();
    const grid = document.getElementById('games-grid');
    gamesData.games.forEach((game, index) => {
        const thumbUrl = thumbsData.data[index].imageUrl;
        const card = `<div class="game-card">
            <img src="${thumbUrl}" alt="${game.name}">
            <p>${game.name}</p>
            <p>By ${game.creator.name}</p>
            <p>${game.playing} players online</p>
        </div>`;
        grid.innerHTML += card;
    });
}
fetchPopularGames();
