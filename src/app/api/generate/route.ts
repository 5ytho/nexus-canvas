// src/app/api/generate/route.ts

const SYSTEM_PROMPT = [
  'You are an elite Principal UI Engineer generating live React components for an isolated dark-mode canvas sandbox.',
  'STRICT OUTPUT RULES:',
  '1. Return ONLY executable React functional component code. NO markdown chatter, NO explanations, NO code fences, and NO import/export statements.',
  '2. Define the root component strictly as: function App() { ... }',
  '3. React hooks (useState, useEffect, useMemo, useCallback, useRef) are globally available in scope.',
  '4. Style exclusively with Tailwind CSS classes using rich dark-mode aesthetics.',
  '5. Always make the component interactive.',
].join('\n');

function getFreeSmartComponent(prompt: string): string {
  const lower = prompt.toLowerCase();
  const cleanTitle = prompt.replace(/[^a-zA-Z0-9 ,.&-]/g, '').slice(0, 42) || 'Spatial Module';

  // 1. Pomodoro / Timer / Task Preset
  if (lower.includes('pomodoro') || lower.includes('timer') || lower.includes('focus') || lower.includes('task')) {
    return [
      'function App() {',
      '  const [secondsLeft, setSecondsLeft] = useState(25 * 60);',
      '  const [isRunning, setIsRunning] = useState(false);',
      '  const [mode, setMode] = useState("focus");',
      '  const [tasks, setTasks] = useState([',
      '    { id: 1, text: "Ship 60FPS Infinite Canvas Engine", done: true },',
      '    { id: 2, text: "Isolate Babel Iframe Sandbox", done: false },',
      '    { id: 3, text: "Record 15s GitHub Demo GIF", done: false }',
      '  ]);',
      '  const [newTask, setNewTask] = useState("");',
      '',
      '  useEffect(() => {',
      '    if (!isRunning) return;',
      '    const timer = setInterval(() => {',
      '      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));',
      '    }, 1000);',
      '    return () => clearInterval(timer);',
      '  }, [isRunning]);',
      '',
      '  const switchMode = (nextMode, mins) => {',
      '    setMode(nextMode);',
      '    setIsRunning(false);',
      '    setSecondsLeft(mins * 60);',
      '  };',
      '',
      '  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");',
      '  const secs = String(secondsLeft % 60).padStart(2, "0");',
      '',
      '  const addTask = (e) => {',
      '    e.preventDefault();',
      '    if (!newTask.trim()) return;',
      '    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), done: false }]);',
      '    setNewTask("");',
      '  };',
      '',
      '  return (',
      '    <div className="min-h-screen bg-[#07080d] text-slate-100 p-4 font-sans select-none">',
      '      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-indigo-950/30 via-[#0c0e17] to-[#090a10] p-5 shadow-2xl">',
      '        <div className="flex items-center justify-between mb-4">',
      '          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">',
      '            Focus Flow Engine',
      '          </span>',
      '          <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">',
      '            <button onClick={() => switchMode("focus", 25)} className={"px-2.5 py-1 rounded text-[11px] font-medium transition " + (mode === "focus" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white")}>Focus 25m</button>',
      '            <button onClick={() => switchMode("break", 5)} className={"px-2.5 py-1 rounded text-[11px] font-medium transition " + (mode === "break" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white")}>Break 5m</button>',
      '          </div>',
      '        </div>',
      '        <div className="text-center py-4 my-2 rounded-xl bg-black/40 border border-white/5">',
      '          <div className="text-5xl font-mono font-bold tracking-tight text-white">{mins}:{secs}</div>',
      '          <div className="mt-4 flex justify-center gap-2">',
      '            <button onClick={() => setIsRunning(!isRunning)} className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95">',
      '              {isRunning ? "Pause Session" : "Start Timer"}',
      '            </button>',
      '            <button onClick={() => switchMode(mode, mode === "focus" ? 25 : 5)} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition">',
      '              Reset',
      '            </button>',
      '          </div>',
      '        </div>',
      '        <form onSubmit={addTask} className="mt-4 flex gap-2">',
      '          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add sprint task..." className="flex-1 rounded-xl bg-black/50 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />',
      '          <button type="submit" className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition">Add</button>',
      '        </form>',
      '        <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">',
      '          {tasks.map((t) => (',
      '            <div key={t.id} onClick={() => setTasks(tasks.map((item) => item.id === t.id ? { ...item, done: !item.done } : item))} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 cursor-pointer transition">',
      '              <span className={"text-xs " + (t.done ? "line-through text-slate-500" : "text-slate-200")}>{t.text}</span>',
      '              <span className={"w-4 h-4 rounded-full border flex items-center justify-center text-[10px] " + (t.done ? "bg-emerald-500 border-emerald-400 text-black font-bold" : "border-white/20")}>{t.done ? "✓" : ""}</span>',
      '            </div>',
      '          ))}',
      '        </div>',
      '      </div>',
      '    </div>',
      '  );',
      '}',
    ].join('\n');
  }

  // 2. Crypto / Orderbook / Swap Preset
  if (lower.includes('crypto') || lower.includes('orderbook') || lower.includes('swap') || lower.includes('token')) {
    return [
      'function App() {',
      '  const [amount, setAmount] = useState("1.5");',
      '  const [fromToken, setFromToken] = useState("ETH");',
      '  const [toToken, setToToken] = useState("SOL");',
      '  const [swapped, setSwapped] = useState(false);',
      '  const rate = fromToken === "ETH" ? 18.42 : 0.054;',
      '  const output = (parseFloat(amount || "0") * rate).toFixed(3);',
      '',
      '  const flipTokens = () => {',
      '    setFromToken(toToken);',
      '    setToToken(fromToken);',
      '  };',
      '',
      '  return (',
      '    <div className="min-h-screen bg-[#07080d] text-slate-100 p-4 font-sans select-none">',
      '      <div className="rounded-2xl border border-white/10 bg-[#0c0f18] p-5 shadow-2xl">',
      '        <div className="flex items-center justify-between mb-4">',
      '          <span className="text-xs font-bold tracking-tight text-white flex items-center gap-2">',
      '            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />',
      '            Nexus DEX Liquidity Pool',
      '          </span>',
      '          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">0.05% Slippage</span>',
      '        </div>',
      '        <div className="rounded-xl bg-black/50 border border-white/10 p-3.5 mb-2">',
      '          <div className="flex justify-between text-[11px] text-slate-400 mb-1"><span>You Pay</span><span>Balance: 14.82 {fromToken}</span></div>',
      '          <div className="flex items-center justify-between">',
      '            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-2xl font-mono font-bold text-white w-1/2 focus:outline-none" />',
      '            <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300">{fromToken}</span>',
      '          </div>',
      '        </div>',
      '        <div className="flex justify-center -my-3 relative z-10">',
      '          <button onClick={flipTokens} className="bg-[#161b2e] hover:bg-indigo-600 text-xs px-3 py-1 rounded-full border border-white/15 text-white shadow-lg transition active:scale-90">',
      '            ⇅ Flip Pair',
      '          </button>',
      '        </div>',
      '        <div className="rounded-xl bg-black/50 border border-white/10 p-3.5 mt-2 mb-4">',
      '          <div className="flex justify-between text-[11px] text-slate-400 mb-1"><span>You Receive (Estimated)</span><span>1 {fromToken} = {rate} {toToken}</span></div>',
      '          <div className="flex items-center justify-between">',
      '            <div className="text-2xl font-mono font-bold text-emerald-400">{output}</div>',
      '            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">{toToken}</span>',
      '          </div>',
      '        </div>',
      '        <button onClick={() => { setSwapped(true); setTimeout(() => setSwapped(false), 2000); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] transition">',
      '          {swapped ? "✓ Swap Executed on L2!" : "Execute Instant Swap"}',
      '        </button>',
      '      </div>',
      '    </div>',
      '  );',
      '}',
    ].join('\n');
  }

  // 3. Audio / Synthesizer / Equalizer Preset
  if (lower.includes('audio') || lower.includes('synth') || lower.includes('equalizer') || lower.includes('music')) {
    return [
      'function App() {',
      '  const [playing, setPlaying] = useState(true);',
      '  const [bpm, setBpm] = useState(128);',
      '  const [bars, setBars] = useState([65, 40, 85, 55, 92, 70, 48, 80, 60, 95, 50, 75]);',
      '  const [activePad, setActivePad] = useState(0);',
      '',
      '  useEffect(() => {',
      '    if (!playing) return;',
      '    const id = setInterval(() => {',
      '      setBars((prev) => prev.map(() => Math.floor(25 + Math.random() * 75)));',
      '    }, Math.max(120, Math.floor(60000 / bpm / 2)));',
      '    return () => clearInterval(id);',
      '  }, [playing, bpm]);',
      '',
      '  const pads = ["Sub Bass", "Neon Lead", "Arp Pulse", "Tape Reverb"];',
      '',
      '  return (',
      '    <div className="min-h-screen bg-[#07080d] text-slate-100 p-4 font-sans select-none">',
      '      <div className="rounded-2xl border border-white/10 bg-[#0b0d16] p-5 shadow-2xl">',
      '        <div className="flex items-center justify-between mb-4">',
      '          <div>',
      '            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">DSP Engine</span>',
      '            <h3 className="text-base font-bold text-white">Nexus Analog Synth</h3>',
      '          </div>',
      '          <button onClick={() => setPlaying(!playing)} className={"px-3 py-1.5 rounded-xl text-xs font-semibold transition " + (playing ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500 text-black")}>{playing ? "Stop Clock" : "Run Sequencer"}</button>',
      '        </div>',
      '        <div className="h-28 rounded-xl bg-black/60 border border-white/10 p-3 flex items-end gap-1.5 mb-4">',
      '          {bars.map((h, i) => (',
      '            <div key={i} style={{ height: h + "%" }} className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 via-cyan-400 to-emerald-300 transition-all duration-150" />',
      '          ))}',
      '        </div>',
      '        <div className="mb-4">',
      '          <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Tempo Clock</span><span className="font-mono text-cyan-300">{bpm} BPM</span></div>',
      '          <input type="range" min="70" max="180" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />',
      '        </div>',
      '        <div className="grid grid-cols-2 gap-2">',
      '          {pads.map((label, idx) => (',
      '            <button key={label} onClick={() => { setActivePad(idx); setBars(bars.map(() => Math.floor(40 + Math.random() * 60))); }} className={"p-3 rounded-xl border text-left transition active:scale-95 " + (activePad === idx ? "bg-indigo-500/25 border-indigo-400 text-white" : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white")}>',
      '              <div className="text-[10px] font-mono opacity-60">PAD 0{idx + 1}</div>',
      '              <div className="text-xs font-semibold mt-0.5">{label}</div>',
      '            </button>',
      '          ))}',
      '        </div>',
      '      </div>',
      '    </div>',
      '  );',
      '}',
    ].join('\n');
  }

  // 4. Default Interactive Module for any custom prompt
  return [
    'function App() {',
    '  const [activeTab, setActiveTab] = useState("overview");',
    '  const [intensity, setIntensity] = useState(78);',
    '  const [isRunning, setIsRunning] = useState(true);',
    '  const [history, setHistory] = useState([42, 58, 64, 51, 79, 88, 74, 96]);',
    '',
    '  const pushSample = () => {',
    '    const nextVal = Math.floor(35 + Math.random() * 64);',
    '    setHistory((prev) => [...prev.slice(1), nextVal]);',
    '    setIntensity(nextVal);',
    '  };',
    '',
    '  return (',
    '    <div className="min-h-screen bg-[#07080d] text-slate-100 p-5 font-sans select-none">',
    '      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5 shadow-2xl">',
    '        <div className="flex items-center justify-between gap-2 mb-4">',
    '          <div>',
    '            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">',
    '              <span className={"w-1.5 h-1.5 rounded-full " + (isRunning ? "bg-emerald-400 animate-ping" : "bg-amber-400")} />',
    '              {isRunning ? "Live Synthesis" : "Standby"}',
    '            </div>',
    '            <h3 className="text-base font-semibold text-white mt-1.5 truncate max-w-[260px]">' + cleanTitle + '</h3>',
    '          </div>',
    '          <button onClick={() => setIsRunning(!isRunning)} className="px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition">',
    '            {isRunning ? "Pause" : "Resume"}',
    '          </button>',
    '        </div>',
    '        <div className="flex gap-1.5 p-1 rounded-xl bg-black/50 border border-white/5 mb-4">',
    '          {["overview", "controls", "telemetry"].map((tab) => (',
    '            <button key={tab} onClick={() => setActiveTab(tab)} className={"flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition " + (activeTab === tab ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-white")}>',
    '              {tab}',
    '            </button>',
    '          ))}',
    '        </div>',
    '        <div className="rounded-xl bg-black/40 border border-white/5 p-4 mb-4">',
    '          <div className="flex justify-between items-center text-xs mb-2">',
    '            <span className="text-slate-400">Harmonic Output Load</span>',
    '            <span className="font-mono font-semibold text-emerald-400">{intensity}%</span>',
    '          </div>',
    '          <input type="range" min="10" max="100" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />',
    '          <div className="h-24 flex items-end gap-1.5 mt-4">',
    '            {history.map((val, idx) => (',
    '              <div key={idx} style={{ height: val + "%" }} className="flex-1 rounded-t bg-gradient-to-t from-indigo-600/50 via-indigo-400 to-emerald-300 transition-all duration-300" />',
    '            ))}',
    '          </div>',
    '        </div>',
    '        <button onClick={pushSample} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-[0.99] transition">',
    '          Trigger Impulse Sample',
    '        </button>',
    '      </div>',
    '    </div>',
    '  );',
    '}',
  ].join('\n');
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (process.env.GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || '';
        return new Response(content, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    } catch {
      // Fall through to built-in free generator
    }
  }

  const sourceCode = getFreeSmartComponent(prompt || 'Spatial Widget');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const step = 32;
      for (let i = 0; i < sourceCode.length; i += step) {
        const chunk = sourceCode.slice(i, i + step);
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 16));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}