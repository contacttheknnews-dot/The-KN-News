"use client";

// Interactive cricket quiz (sample questions; editable from admin later).

import { useState } from "react";

const QUESTIONS = [
  {
    q: "टेस्ट क्रिकेट में सबसे ज्यादा रन किस देश के बल्लेबाज़ के नाम हैं?",
    options: ["भारत", "ऑस्ट्रेलिया", "इंग्लैंड", "वेस्टइंडीज"],
    answer: 0,
  },
  {
    q: "एक ओवर में कितनी वैध गेंदें होती हैं?",
    options: ["4", "5", "6", "8"],
    answer: 2,
  },
  {
    q: "ODI क्रिकेट में दोहरा शतक लगाने वाले पहले बल्लेबाज़ किस देश से थे?",
    options: ["श्रीलंका", "भारत", "पाकिस्तान", "दक्षिण अफ्रीका"],
    answer: 1,
  },
  {
    q: "क्रिकेट पिच की लंबाई कितनी होती है?",
    options: ["20 गज", "22 गज", "24 गज", "26 गज"],
    answer: 1,
  },
  {
    q: "T20 अंतरराष्ट्रीय मैच में प्रति पारी कितने ओवर होते हैं?",
    options: ["10", "15", "20", "25"],
    answer: 2,
  },
];

export default function CricketQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = QUESTIONS[current];

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === question.answer) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (current + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="bg-white border border-kn-border rounded-lg p-8 text-center">
        <p className="text-5xl mb-3">🏆</p>
        <h2 className="text-2xl font-extrabold">
          आपका स्कोर: <span className="text-kn-red">{score}/{QUESTIONS.length}</span>
        </h2>
        <p className="mt-2 text-kn-muted">
          {score === QUESTIONS.length
            ? "शानदार! आप सच्चे क्रिकेट प्रेमी हैं।"
            : score >= 3
              ? "बहुत बढ़िया! थोड़ी और प्रैक्टिस कीजिए।"
              : "कोई बात नहीं — क्रिकेट की खबरें पढ़ते रहिए!"}
        </p>
        <button
          onClick={restart}
          className="mt-5 rounded-md bg-kn-red px-6 py-2.5 text-sm font-bold text-white hover:bg-kn-red-dark"
        >
          फिर से खेलें
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-kn-border rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-lg">🏏 क्रिकेट क्विज</h2>
        <span className="text-xs font-bold text-kn-muted">
          प्रश्न {current + 1} / {QUESTIONS.length}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-kn-gray mb-6">
        <div
          className="h-full rounded-full bg-kn-red transition-all"
          style={{ width: `${((current + (selected !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <p className="text-lg font-bold mb-5">{question.q}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          let cls = "border-kn-border bg-white hover:border-kn-red";
          if (selected !== null) {
            if (i === question.answer) cls = "border-green-600 bg-green-50 text-green-800";
            else if (i === selected) cls = "border-kn-red bg-kn-red-light text-kn-red";
            else cls = "border-kn-border bg-white opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={`rounded-md border-2 px-4 py-3 text-left text-sm font-semibold transition-colors ${cls}`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <button
          onClick={nextQuestion}
          className="mt-6 rounded-md bg-kn-dark px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
        >
          {current + 1 >= QUESTIONS.length ? "परिणाम देखें →" : "अगला प्रश्न →"}
        </button>
      )}
    </div>
  );
}
