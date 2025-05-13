import { useState } from "react";
import "./styles.css";

const todos = [
  { id: 1, label: "Plan clair du trade", bonus: 0.25 },
  { id: 2, label: "Confluence avec POI", bonus: 0.5 },
  { id: 3, label: "Volume incohérent détecté", bonus: -0.25 },
  { id: 4, label: "FOMO identifié", bonus: -0.5 },
  { id: 5, label: "Pas de news proches", bonus: 0.25 },
];

const RScoreCalculator = () => {
  const [checked, setChecked] = useState([]);

  const handleCheck = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const bonusTotal = checked.reduce((sum, id) => {
    const item = todos.find((t) => t.id === id);
    return item ? sum + item.bonus : sum;
  }, 0);

  const totalR = Math.max(0, 1 + bonusTotal); // Le R ne descend jamais sous 0

  return (
    <div className="container">
      <h2>✅ To-Do List de Trading</h2>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={checked.includes(todo.id)}
                onChange={() => handleCheck(todo.id)}
              />
              {todo.label} {" "}
              <span className={todo.bonus >= 0 ? "bonus" : "penalty"}>
                {todo.bonus >= 0 ? `+${todo.bonus}` : `${todo.bonus}`} R
              </span>
            </label>
          </li>
        ))}
      </ul>
      <hr />
      <p className="score">R conseillé : <strong>{totalR.toFixed(2)} R</strong></p>
    </div>
  );
};

export default RScoreCalculator;