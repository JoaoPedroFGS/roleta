import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const redNumbers = [
  1,3,5,7,9,12,14,16,18,19,
  21,23,25,27,30,32,34,36
];

export default function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  function parseInput() {
    const parsed = input
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .map((item) => {
        if (item === "vermelho" || item === "preto" || item === "verde") return item;

        const num = Number(item);

        if (!isNaN(num)) {
          if (num === 0) return "verde";
          return redNumbers.includes(num) ? "vermelho" : "preto";
        }

        return null;
      })
      .filter(Boolean);

    setResults(parsed);
  }

  function analyze() {
    let red = 0;
    let black = 0;
    let green = 0;

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 0; i < results.length; i++) {
      if (results[i] === "vermelho") red++;
      if (results[i] === "preto") black++;
      if (results[i] === "verde") green++;

      if (i > 0 && results[i] === results[i - 1]) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 1;
      }
    }

    return { red, black, green, currentStreak, maxStreak };
  }

  function simulateStrategies() {
    let followWin = 0;
    let followLoss = 0;

    let invertWin = 0;
    let invertLoss = 0;

    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const current = results[i];

      if (prev === "verde" || current === "verde") continue;

      if (prev === current) followWin++;
      else followLoss++;

      if (prev !== current) invertWin++;
      else invertLoss++;
    }

    return {
      follow: {
        win: followWin,
        loss: followLoss,
        rate: ((followWin / (followWin + followLoss)) * 100 || 0).toFixed(1),
      },
      invert: {
        win: invertWin,
        loss: invertLoss,
        rate: ((invertWin / (invertWin + invertLoss)) * 100 || 0).toFixed(1),
      },
    };
  }

  function getStreakInfo() {
    if (results.length === 0) return null;

    const last = results[results.length - 1];
    let count = 1;

    for (let i = results.length - 2; i >= 0; i--) {
      if (results[i] === last) count++;
      else break;
    }

    return { color: last, count };
  }

  function getBestStrategy(sim) {
    return sim.follow.rate > sim.invert.rate
      ? "Seguir cor"
      : "Inverter cor";
  }

  function getNextSuggestion(sim) {
    if (results.length < 2) return "Sem dados";

    const last = results[results.length - 1];

    if (last === "verde") return "Aguardar";

    return getBestStrategy(sim) === "Seguir cor"
      ? last
      : last === "vermelho"
      ? "preto"
      : "vermelho";
  }

  function getAlert(streak) {
    if (!streak) return null;

    if (streak.count >= 4) {
      return "⚠️ Possível reversão chegando";
    }

    return "Padrão neutro";
  }

  const data = analyze();
  const sim = simulateStrategies();
  const streak = getStreakInfo();

  const total = data.red + data.black;

  const redPercent = total ? ((data.red / total) * 100).toFixed(1) : 0;
  const blackPercent = total ? ((data.black / total) * 100).toFixed(1) : 0;

  const chartData = {
    labels: ["Vermelho", "Preto", "Verde"],
    datasets: [
      {
        data: [data.red, data.black, data.green],
        backgroundColor: ["#dc2626", "#1f2937", "#16a34a"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-extrabold mb-8 text-center">
          🧠 Dashboard PRO+ Roleta
        </h1>

        {/* INPUT */}
        <div className="bg-gray-900 p-6 rounded-2xl mb-6 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parseInput()}
            placeholder="Digite números ou cores (ex: 1, preto, 0, vermelho...)"
            className="w-full h-24 p-3 rounded bg-black border border-gray-700"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={parseInput}
              className="bg-green-600 px-6 py-2 rounded hover:bg-green-500"
            >
              Analisar
            </button>

            <button
              onClick={() => {
                setInput("");
                setResults([]);
              }}
              className="bg-red-600 px-6 py-2 rounded hover:bg-red-500"
            >
              Limpar
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <>
            {/* STATS */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-600 p-4 rounded-xl shadow">
                Vermelho: {data.red} ({redPercent}%)
              </div>
              <div className="bg-gray-700 p-4 rounded-xl shadow">
                Preto: {data.black} ({blackPercent}%)
              </div>
              <div className="bg-green-600 p-4 rounded-xl shadow">
                Verde: {data.green}
              </div>
              <div className="bg-yellow-500 text-black p-4 rounded-xl shadow">
                Maior streak: {data.maxStreak}
              </div>
            </div>

            {/* STREAK + ALERT */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-600 p-4 rounded-xl">
                Sequência atual: {streak?.count}x {streak?.color}
              </div>

              <div className="bg-purple-600 p-4 rounded-xl">
                {getAlert(streak)}
              </div>
            </div>

            {/* GRÁFICO */}
            <div className="mb-6 bg-gray-900 p-6 rounded-xl">
              <Pie data={chartData} />
            </div>

            {/* ESTRATÉGIAS */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h2 className="font-bold mb-4">Seguir cor</h2>
                <p>Acertos: {sim.follow.win}</p>
                <p>Erros: {sim.follow.loss}</p>
                <p>Taxa: {sim.follow.rate}%</p>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h2 className="font-bold mb-4">Inverter cor</h2>
                <p>Acertos: {sim.invert.win}</p>
                <p>Erros: {sim.invert.loss}</p>
                <p>Taxa: {sim.invert.rate}%</p>
              </div>
            </div>

            {/* MELHOR + SUGESTÃO */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-700 p-6 rounded-xl text-center font-bold">
                Melhor estratégia: {getBestStrategy(sim)}
              </div>

              <div className="bg-purple-700 p-6 rounded-xl text-center font-bold">
                Próxima jogada: {getNextSuggestion(sim)}
              </div>
            </div>

            {/* HISTÓRICO */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                    r === "vermelho"
                      ? "bg-red-600"
                      : r === "preto"
                      ? "bg-gray-700"
                      : "bg-green-600"
                  }`}
                >
                  {r === "vermelho" ? "R" : r === "preto" ? "P" : "V"}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}