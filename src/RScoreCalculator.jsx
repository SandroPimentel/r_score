import { useEffect, useState } from "react";
import "./styles.css";

const RScoreCalculator = () => {
  const [capital, setCapital] = useState(1000);
  const [rMode, setRMode] = useState("usd");
  const [rInput, setRInput] = useState("10");

  const staticTodos = [
    { id: 1, label: "Plan clair défini", bonus: 0.25 },
    { id: 2, label: "Pas de news importantes", bonus: 0.25 },
    { id: 3, label: "Volume suffisant", bonus: 0.25 },
    { id: 4, label: "Pas de FOMO ou doute", bonus: 0.25 },
    { id: 5, label: "Confluence valide", bonus: 0.5 },
    { id: 6, label: "SL bien placé", bonus: 0.5 },
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
      <h2>✅ To-Do List de Trading (statique)</h2>

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