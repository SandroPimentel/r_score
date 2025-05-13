import { useEffect, useState } from "react";
import "./styles.css";

const RScoreCalculator = () => {
  const [capital, setCapital] = useState(1000);
  const [rMode, setRMode] = useState("usd");
  const [rInput, setRInput] = useState("10");

  const staticTodos = [
    { id: 1, label: "Volume suffisant", bonus: 0.3 },
    { id: 2, label: "Pas de FOMO", bonus: 0.3 },
    { id: 3, label: "Confirmation des indicateurs", bonus: 0.25 },
    { id: 4, label: "Trade avec la tendance du marché", bonus: 0.3 },
    { id: 5, label: "Session US", bonus: 0.3 },
    { id: 6, label: "Possibilité de suivre le trade", bonus: 0.3 },
    { id: 7, label: "Confirmation du canal Telegram", bonus: 0.4 },
    { id: 8, label: "Confirmation du canal Discord", bonus: 0.5 },
    { id: 9, label: "Trade sur le top 10 hors BTC", bonus: -0.3 },
    { id: 10, label: "Trade sur une low cap", bonus: -0.5 },
    { id: 11, label: "Trade short", bonus: -0.25 },
    { id: 12, label: "Trade marché US fermé", bonus: -0.3 },
    { id: 13, label: "Trade avant une news", bonus: -0.3 },
    { id: 14, label: "Trade à contre sens", bonus: -0.3 },
    { id: 15, label: "Trade au travail", bonus: -0.5 }
  ];

  const [checked, setChecked] = useState([]);
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [positionSize, setPositionSize] = useState(null);
  const [rr, setRr] = useState(null);

  const handleCheck = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const bonusTotal = checked.reduce((sum, id) => {
    const item = staticTodos.find((t) => t.id === id);
    return item ? sum + item.bonus : sum;
  }, 0);

  const rBaseValue =
    rMode === "usd" ? parseFloat(rInput) : (parseFloat(rInput) / 100) * capital;
  const rPercent =
    rMode === "percent"
      ? rInput
      : ((parseFloat(rInput) / capital) * 100).toFixed(2);
  const totalRValue = Math.max(0, rBaseValue * (1 + bonusTotal));

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

  return (
    <div className="container">
      <h2 style={{ marginBottom: "1rem" }}>✅ To-Do List de Trading (statique)</h2>

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
        {staticTodos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", marginRight: "8px" }}
                checked={checked.includes(todo.id)}
                onChange={() => handleCheck(todo.id)}
              />
              {todo.label} <span className={todo.bonus >= 0 ? "bonus" : "penalty"}>{todo.bonus >= 0 ? `+${todo.bonus}` : `${todo.bonus}`} R</span>
            </label>
          </li>
        ))}
      </ul>

      <hr />
      <p className="score">💵 R conseillé (après checklist) : <strong>{totalRValue.toFixed(2)} $</strong></p>

      <hr />
      <h3 style={{ marginBottom: "1rem" }}>📏 Calculateur de taille de position</h3>
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
        <p>📊 Risk/Reward : <strong>{rr}</strong> ({(rr * totalRValue).toFixed(2)} $)</p>
      )}
    </div>
  );
};

export default RScoreCalculator;