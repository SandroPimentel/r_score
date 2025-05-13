import { useEffect, useState } from "react";
import "./styles.css";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBSFJmUzrDh7S5mLAV7_DgtqYuDE_01vag",
  authDomain: "journal-app-a3326.firebaseapp.com",
  projectId: "journal-app-a3326",
  storageBucket: "journal-app-a3326.firebasestorage.app",
  messagingSenderId: "173498770447",
  appId: "1:173498770447:web:60394ed9da7df46687ef7a",
  measurementId: "G-EB8HD1KXEX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const RScoreCalculator = () => {
  const [user, setUser] = useState(null);
  const [capital, setCapital] = useState(1000);
  const [rMode, setRMode] = useState("usd");
  const [rInput, setRInput] = useState("10");
  const [todos, setTodos] = useState([]);
  const [checked, setChecked] = useState([]);

  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [positionSize, setPositionSize] = useState(null);
  const [rr, setRr] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  useEffect(() => {
    if (!user) return;
    const fetchTodos = async () => {
      const snapshot = await getDocs(collection(db, "todos"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodos(data);
    };
    fetchTodos();
  }, [user]);

  const handleCheck = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const bonusTotal = checked.reduce((sum, id) => {
    const item = todos.find((t) => t.id === id);
    return item ? sum + item.bonus : sum;
  }, 0);

  const rBaseValue = rMode === "usd" ? parseFloat(rInput) : (parseFloat(rInput) / 100) * capital;
  const rPercent = rMode === "percent" ? rInput : ((parseFloat(rInput) / capital) * 100).toFixed(2);
  const totalRValue = Math.max(0, rBaseValue * (1 + bonusTotal));

  const addTodo = async () => {
    const label = prompt("Nom de la tâche :");
    const bonus = parseFloat(prompt("Valeur en R (ex: 0.25 ou -0.5) :"));
    if (!label || isNaN(bonus)) return;
    const docRef = await addDoc(collection(db, "todos"), { label, bonus });
    setTodos([...todos, { id: docRef.id, label, bonus }]);
  };

  const removeTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
    setTodos(todos.filter(t => t.id !== id));
    setChecked(checked.filter(c => c !== id));
  };

  const calculateSizing = () => {
    const e = parseFloat(entry);
    const s = parseFloat(sl);
    const t = parseFloat(tp);
    if (!e || !s || isNaN(e) || isNaN(s)) {
      setPositionSize(null);
      setRr(null);
      return;
    }
    const stop = Math.abs(e - s);
    if (stop === 0) return;
    const size = totalRValue / stop;
    setPositionSize(size.toFixed(4));

    if (t) {
      const rrValue = Math.abs(t - e) / stop;
      setRr(rrValue.toFixed(2));
    } else {
      setRr(null);
    }
  };

  useEffect(() => {
    calculateSizing();
  }, [entry, sl, tp, totalRValue]);

  if (!user) {
    return (
      <div className="container">
        <h2>🧮 Calculateur de R + Checklist</h2>
        <button onClick={login}>🔐 Se connecter avec Google</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>✅ To-Do List de Trading</h2>
        <button onClick={logout}>🚪 Déconnexion</button>
      </div>

      <label>💰 Capital ($) :
        <input type="number" value={capital} onChange={(e) => setCapital(parseFloat(e.target.value))} />
      </label>

      <label>🎯 R de base :
        <select value={rMode} onChange={(e) => setRMode(e.target.value)}>
          <option value="usd">Montant fixe ($)</option>
          <option value="percent">% du capital</option>
        </select>
        <input
          type="number"
          value={rInput}
          onChange={(e) => setRInput(e.target.value)}
          placeholder={rMode === "usd" ? "Montant $" : "% du capital"}
        />
        <p>Équivalent : <strong>{rMode === "usd" ? `${rPercent}%` : `${rBaseValue.toFixed(2)} $`}</strong></p>
      </label>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={checked.includes(todo.id)}
                onChange={() => handleCheck(todo.id)}
              />
              {todo.label} <span className={todo.bonus >= 0 ? "bonus" : "penalty"}>{todo.bonus >= 0 ? `+${todo.bonus}` : `${todo.bonus}`} R</span>
              <button onClick={() => removeTodo(todo.id)} style={{ marginLeft: "1rem" }}>🗑</button>
            </label>
          </li>
        ))}
      </ul>
      <button onClick={addTodo}>➕ Ajouter une tâche</button>

      <hr />
      <p className="score">💵 R conseillé (après checklist) : <strong>{totalRValue.toFixed(2)} $</strong></p>

      <hr />
      <h3>📏 Calculateur de taille de position</h3>
      <label>Prix d'entrée :
        <input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} />
      </label>
      <label>Stop Loss :
        <input type="number" value={sl} onChange={(e) => setSl(e.target.value)} />
      </label>
      <label>Take Profit (optionnel) :
        <input type="number" value={tp} onChange={(e) => setTp(e.target.value)} />
      </label>

      {positionSize && (
        <p>🧮 Taille de position : <strong>{positionSize}</strong></p>
      )}

      {rr && (
        <p>📊 Risk/Reward : <strong>{rr}</strong></p>
      )}
    </div>
  );
};

export default RScoreCalculator;