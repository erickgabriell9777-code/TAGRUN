import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createMatch, finishMatch, getRemainingSeconds, hasLocalCapture, registerCapture, startMatch, type MatchSession } from "../domain/match";
import "./styles.css";

const STORAGE_KEY = "tagrun.web.match.v1";
function readMatch(): MatchSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as MatchSession : null;
  } catch { return null; }
}
function App() {
  const [match, setMatch] = useState<MatchSession | null>(readMatch);
  const [name, setName] = useState("Jogador");
  const [duration, setDuration] = useState(15);
  const [captors, setCaptors] = useState(1);
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState("");
  useEffect(() => { if (match) localStorage.setItem(STORAGE_KEY, JSON.stringify(match)); else localStorage.removeItem(STORAGE_KEY); }, [match]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 500); return () => window.clearInterval(timer); }, []);
  const remaining = useMemo(() => match ? getRemainingSeconds(match, now) : 0, [match, now]);
  useEffect(() => { if (match?.status === "running" && remaining === 0) setMatch(current => current ? finishMatch(current, now) : current); }, [match?.status, remaining, now]);
  const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const create = () => {
    try { setMatch(createMatch({ playerName: name, durationMinutes: duration, captorCount: captors })); setNotice("Sala criada neste aparelho."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível criar a partida."); }
  };
  const capture = () => { if (match) { setMatch(registerCapture(match)); setNotice("Captura registrada neste aparelho."); } };
  const reset = () => { setMatch(null); setNotice(""); };
  const captures = match?.events.length ?? 0;
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">T</span><span>TAG<span className="cyan">RUN</span><small>O PEGA-PEGA DA VIDA REAL</small></span></a><span className="status-pill"><i/> PRÉ-VERSÃO WEB</span></header>
    <main>
      <section className="hero"><div className="eyebrow"><span/> A CIDADE É O SEU CAMPO</div><h1>Corra. Encontre.<br/><span>Não seja pego.</span></h1><p>Transforme qualquer lugar seguro em uma arena de pega-pega com seus amigos.</p><div className="hero-actions"><a className="primary-btn" href="#partida">Começar partida <b>↗</b></a><a className="secondary-btn" href="#como-funciona">Como funciona</a></div><div className="hero-stats"><div><strong>01</strong><small>CRIE UMA PARTIDA</small></div><div><strong>02</strong><small>REÚNA A GALERA</small></div><div><strong>03</strong><small>COMECE A CAÇADA</small></div></div></section>
      <section className="game-panel" id="partida"><div className="panel-heading"><div><span className="section-kicker">CENTRAL DE PARTIDA</span><h2>{match ? (match.status === "waiting" ? "Sala preparada" : match.status === "running" ? "Partida em andamento" : "Partida finalizada") : "Prepare sua partida"}</h2></div><span className="live-tag"><i/> LOCAL</span></div>
      {!match ? <div className="setup-grid"><div className="form-column"><label>SEU NOME<input value={name} maxLength={20} onChange={e=>setName(e.target.value)} placeholder="Como quer ser chamado?"/></label><div className="two-fields"><label>DURAÇÃO<select value={duration} onChange={e=>setDuration(Number(e.target.value))}>{[5,10,15,20,30,45,60,90,120,180].map(n=><option key={n} value={n}>{n} minutos</option>)}</select></label><label>PEGADORES<select value={captors} onChange={e=>setCaptors(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} {n===1?"pegador":"pegadores"}</option>)}</select></label></div><button className="primary-btn full" onClick={create}>Criar partida <b>→</b></button></div><div className="preview-card"><div className="preview-top"><span>ÁREA DE JOGO</span><span className="lock">◈ CONFIGURAÇÃO LOCAL</span></div><div className="map-preview"><div className="map-grid"/><div className="zone zone-outer"/><div className="zone zone-inner"/><div className="you-pin"><span/></div><span className="map-label">SUA POSIÇÃO</span><span className="map-coord">MAPA SERÁ CONECTADO NA PRÓXIMA ETAPA</span></div><p>O mapa real e a definição da área ainda serão integrados.</p></div></div> : <div className="match-view"><div className="match-metrics"><div><small>TEMPO RESTANTE</small><strong className="timer">{clock(remaining)}</strong></div><div><small>CAPTURAS</small><strong>{captures}</strong></div><div><small>PEGADORES</small><strong>{match.captorCount}</strong></div></div><div className="match-info"><span>JOGADOR</span><strong>{match.playerName}</strong><span>STATUS</span><strong>{match.status === "waiting" ? "Aguardando início" : match.status === "running" ? "Em andamento" : "Finalizada"}</strong></div>{notice && <p className="notice">{notice}</p>}<div className="match-actions">{match.status==="waiting" && <button className="primary-btn" onClick={()=>{setMatch(startMatch(match));setNotice("Cronômetro iniciado.");}}>Iniciar partida →</button>}{match.status==="running" && <button className="capture-btn" onClick={capture} disabled={hasLocalCapture(match)}>FUI PEGO</button>}{match.status!=="finished" && <button className="secondary-btn" onClick={()=>setMatch(finishMatch(match))}>Encerrar partida</button>}<button className="text-btn" onClick={reset}>Descartar e criar outra</button></div><p className="prototype-warning">Protótipo local: esta partida existe somente neste navegador. Outros jogadores ainda não estão conectados.</p></div>}
      </section>
      <section className="feature-strip" id="como-funciona"><div><span>01 / MAPA</span><h3>O mundo real é o tabuleiro.</h3><p>GPS e mapa para localizar a área da partida e os participantes.</p></div><div><span>02 / RADAR</span><h3>A tensão aumenta.</h3><p>Janelas sincronizadas de localização para deixar a caçada estratégica.</p></div><div><span>03 / OFFLINE</span><h3>Jogue mesmo sem sinal.</h3><p>Estamos construindo a comunicação local entre aparelhos, sem prometer alcance ilimitado.</p></div></section>
    </main><footer><span>TAG<span className="cyan">RUN</span> © 2026</span><span>FEITO PARA SAIR DA TELA E IR PRA RUA.</span></footer>
  </div>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);