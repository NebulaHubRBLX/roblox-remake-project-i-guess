import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChat(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, []);

  const handleSignup = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const sendMessage = async () => {
    if (message.trim()) {
      await addDoc(collection(db, 'messages'), {
        text: message,
        user: user.email,
        timestamp: serverTimestamp(),
      });
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {!user ? (
        <div>
          <h2>Login / Signup</h2>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignup}>Sign Up</button>
        </div>
      ) : (
        <div>
          <h2>Welcome {user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
          <div style={{ marginTop: '20px' }}>
            <h3>Global Chat</h3>
            <div style={{ border: '1px solid #ccc', padding: '10px', height: '200px', overflowY: 'auto' }}>
              {chat.map((c, i) => (
                <div key={i}><strong>{c.user}: </strong>{c.text}</div>
              ))}
            </div>
            <input
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;