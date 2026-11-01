'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown, ArrowRight, BrainCircuit, Braces, Check, CircleDot, Database,
  FileJson, Gauge, GripVertical, Layers3, Network, Play, RotateCcw, Search,
  Sparkles, Workflow, Zap,
} from 'lucide-react'

type StageId = 'ingestion' | 'database' | 'llm'

type Stage = {
  id: StageId
  step: string
  title: string
  short: string
  detail: string
  metric: string
  good: string
  bad: string
  accent: 'cyan' | 'amber' | 'violet'
  icon: typeof FileJson
}

const stageData: Record<StageId, Stage> = {
  ingestion: { id: 'ingestion', step: '01 / INGEST', title: 'Data ingestion + chunking', short: 'Parse SEC EDGAR XBRL filings into typed, traceable facts.', detail: 'XBRL parser → normalized facts → semantic chunks', metric: '12.4k chunks / filing', good: 'Schema-aware chunks preserve filing, page, and period metadata.', bad: 'If skipped, retrieval sees raw HTML and loses the evidence trail.', accent: 'cyan', icon: FileJson },
  database: { id: 'database', step: '02 / STORE', title: 'Vector embeddings', short: 'Generate embeddings and store semantic memory in Supabase pgvector.', detail: '384 dimensions · cosine distance · metadata filters', metric: '384 dimensions', good: 'Provenance stays attached while nearest-neighbor search finds meaning.', bad: 'If moved first, vectors have no clean source material to represent.', accent: 'amber', icon: Database },
  llm: { id: 'llm', step: '03 / INFER', title: 'Retrieval + inference', short: 'Expand the query, rerank context, then ground Groq LPU and FinBERT.', detail: 'multi-query search → rerank → answer + sentiment', metric: '184 ms response', good: 'Parallel retrieval grounds a fast answer with sentiment context.', bad: 'Without retrieval first, the model can sound confident but hallucinate.', accent: 'violet', icon: BrainCircuit },
}

const defaultOrder: StageId[] = ['ingestion', 'database', 'llm']

function analyzeQuery(input: string, mode: string) {
  const normalized = input.trim().toLowerCase()
  const tokenCount = normalized ? normalized.split(/\s+/).length : 0
  const hasFinancialSignal = /margin|revenue|ebitda|cash|growth|filing|risk|income|q[1-4]|sec|guidance/.test(normalized)
  const hasSentimentSignal = /risk|concern|decline|loss|uncertain|warning/.test(normalized)
  const modeBoost = mode === 'strict evidence' ? 4 : mode === 'hybrid' ? 2 : 0
  const chunks = Math.max(3, Math.min(14, 4 + tokenCount + (hasFinancialSignal ? 3 : 0) + modeBoost))
  const confidence = Math.min(0.98, 0.61 + (hasFinancialSignal ? 0.18 : 0.04) + Math.min(tokenCount, 8) * 0.018 + modeBoost * 0.01)
  const latency = 142 + tokenCount * 11 + (mode === 'hybrid' ? 24 : mode === 'strict evidence' ? 41 : 0)
  return { chunks, confidence: confidence.toFixed(2), latency, sentiment: hasSentimentSignal ? 'CAUTIOUS' : hasFinancialSignal ? 'POSITIVE' : 'NEUTRAL', grounded: hasFinancialSignal }
}

function StageCard({ stage, index, active, running, onHover, onDragStart, onDrop }: { stage: Stage; index: number; active: boolean; running: boolean; onHover: () => void; onDragStart: () => void; onDrop: () => void }) {
  const Icon = stage.icon
  return (
    <article draggable onDragStart={onDragStart} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onMouseEnter={onHover} className={`live-stage stage-${stage.accent} ${active ? 'stage-active' : ''} ${running ? 'stage-running' : ''}`}>
      <div className="stage-top"><span className="stage-index">{String(index + 1).padStart(2, '0')}</span><GripVertical size={15} className="drag-hint" aria-label="Draggable stage" /></div>
      <div className="stage-icon"><Icon size={21} /></div>
      <p className="stage-step">{stage.step}</p>
      <h3>{stage.title}</h3>
      <p className="stage-short">{stage.short}</p>
      <div className="stage-metric"><Gauge size={13} /> {stage.metric}</div>
    </article>
  )
}

export default function RagShowcase() {
  const [order, setOrder] = useState<StageId[]>(defaultOrder)
  const [active, setActive] = useState<StageId>('ingestion')
  const [playing, setPlaying] = useState(false)
  const [flowIndex, setFlowIndex] = useState(-1)
  const [dragged, setDragged] = useState<StageId | null>(null)
  const [cursor, setCursor] = useState({ x: -100, y: -100 })
  const [darkMode, setDarkMode] = useState(false)
  const [query, setQuery] = useState('Why did gross margin expand in Q3?')
  const [queryMode, setQueryMode] = useState('semantic')
  const [lastRunQuery, setLastRunQuery] = useState('Why did gross margin expand in Q3?')
  const [queryStats, setQueryStats] = useState(() => analyzeQuery('Why did gross margin expand in Q3?', 'semantic'))

  useEffect(() => {
    const updateCursor = (event: PointerEvent) => setCursor({ x: event.clientX, y: event.clientY })
    window.addEventListener('pointermove', updateCursor)
    return () => window.removeEventListener('pointermove', updateCursor)
  }, [])

  useEffect(() => {
    if (!playing) return
    if (flowIndex >= order.length) { setPlaying(false); return }
    const timer = window.setTimeout(() => setFlowIndex((value) => value + 1), 1050)
    return () => window.clearTimeout(timer)
  }, [playing, flowIndex, order.length])

  const activeStage = stageData[active]
  const ActiveIcon = activeStage.icon
  const flowLabel = flowIndex < 0 ? 'READY TO SIMULATE' : flowIndex >= order.length ? 'ANSWER GROUNDED' : `PROCESSING ${stageData[order[flowIndex]].step}`
  const health = useMemo(() => {
    const ideal = order.every((id, i) => id === defaultOrder[i])
    return ideal ? { value: 'OPTIMAL', tone: 'good', note: 'Canonical order: source → memory → inference' } : { value: 'DEGRADED', tone: 'bad', note: 'The workflow is reordered. Compare the evidence path.' }
  }, [order])

  function moveStage(from: StageId, to: StageId) {
    if (from === to) return
    const next = [...order]
    const fromIndex = next.indexOf(from)
    const toIndex = next.indexOf(to)
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, from)
    setOrder(next)
    setFlowIndex(-1)
    setPlaying(false)
    setActive(from)
  }

  function playFlow() { setFlowIndex(0); setPlaying(true); setActive(order[0]) }
  function runQuery() {
    const nextQuery = query.trim() || 'Untitled financial question'
    setQuery(nextQuery)
    setLastRunQuery(nextQuery)
    setQueryStats(analyzeQuery(nextQuery, queryMode))
    playFlow()
  }

  return (
    <main className={`min-h-screen overflow-hidden bg-background text-foreground ${darkMode ? 'dark-mode' : ''}`}>
      <div className="cursor-glow" style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} aria-hidden="true"><span /></div>
      <div className="aurora aurora-one" /><div className="aurora aurora-two" />
      <div className="site-shell">
        <header className="topbar"><a className="brand" href="#top" aria-label="FinSight architecture home"><span className="brand-mark"><CircleDot size={16} /></span><span>FINSIGHT <em>/ RAG SYSTEM</em></span></a><div className="header-meta"><span className="status-dot" /> SYSTEM ONLINE <span className="meta-divider" /> LIVE PLAYGROUND <button className="theme-toggle" type="button" onClick={() => setDarkMode((value) => !value)} aria-pressed={darkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? 'LIGHT' : 'DARK'} <span className="theme-switch" /></button></div></header>

        <section id="top" className="hero-grid hero-updated"><div className="hero-copy"><p className="kicker"><span>01</span> FINANCIAL INTELLIGENCE / SYSTEM PLAYGROUND</p><h1>Make the<br /><span>signal move.</span></h1><p className="hero-lede">Reorder the architecture, then play the pipeline. Watch a financial query travel from SEC evidence to a grounded answer.</p><a className="scroll-cue" href="#pipeline"><ArrowDown size={15} /> Enter the simulator</a></div><div className="hero-readout pulse-readout"><div className="readout-label">LIVE SYSTEM READOUT</div><div className="readout-value">RAG<span>_</span>FIN-01</div><div className="readout-rule" /><div className="readout-grid"><span>FLOW STATE</span><strong>{flowLabel}</strong><span>PIPELINE HEALTH</span><strong className={health.tone === 'bad' ? 'amber-text' : ''}>{health.value}</strong></div></div></section>

        <section id="pipeline" className="architecture-section"><div className="section-heading"><div><p className="kicker"><span>02</span> ARCHITECTURE / LIVE SIMULATOR</p><h2>Move the evidence.</h2></div><p className="section-note">Drag a stage to reorder the workflow.<br />Then press play to trace the signal.</p></div>
          <div className="simulator-bar"><div><span className="live-dot" /> {flowLabel}</div><div className="simulator-actions"><button className="play-button" onClick={playFlow} disabled={playing}><Play size={14} fill="currentColor" /> {playing ? 'RUNNING' : 'PLAY FLOW'}</button><button className="reset-button" onClick={() => { setOrder(defaultOrder); setFlowIndex(-1); setPlaying(false); setActive('ingestion') }}><RotateCcw size={14} /> RESET</button></div></div>
          <div className="architecture-board interactive-board"><div className="board-topline"><span>QUERY-TO-ANSWER PIPELINE / DRAG TO REWIRE</span><span><span className="cyan-text">●</span> {health.value}</span></div><div className="reorder-grid">{order.map((id, index) => <div key={id} className="stage-slot"><StageCard stage={stageData[id]} index={index} active={active === id} running={playing && flowIndex === index} onHover={() => setActive(id)} onDragStart={() => setDragged(id)} onDrop={() => dragged && moveStage(dragged, id)} />{index < order.length - 1 && <div className={`flow-connector ${playing && flowIndex > index ? 'flow-complete' : ''}`}><span className="flow-particle" /><ArrowRight size={18} /><small>{index === 0 ? 'EMBED' : 'GROUND'}</small></div>}</div>)}</div><div className="board-footer"><span><span className="cyan-text">●</span> MOVING DATA CHANNEL</span><span>SEC EDGAR → SUPABASE → GROQ / FINBERT</span></div></div>
        </section>

        <section className="detail-section live-detail" aria-live="polite"><div className={`detail-marker marker-${activeStage.accent}`}><ActiveIcon size={18} /><span>{activeStage.step}</span></div><div className="detail-main"><p className="kicker">{flowIndex >= 0 ? 'LIVE TELEMETRY' : 'TECHNICAL EXPLANATION'}</p><h2>{activeStage.title}</h2><p>{activeStage.short}</p><div className={`outcome ${health.tone}`}><Sparkles size={14} /> {health.tone === 'good' ? activeStage.good : activeStage.bad}</div></div><div className="detail-spec"><span>IMPLEMENTATION</span><strong>{activeStage.detail}</strong><span className="spec-arrow"><Zap size={15} /> {flowIndex === order.indexOf(active) ? 'processing now' : 'hover a stage to inspect'}</span></div></section>

        <section className="modules-section"><div className="section-heading compact"><div><p className="kicker"><span>03</span> SYSTEM MODULES / EXPLAINED</p><h2>Built for evidence.</h2></div><p className="section-note">The canonical path is a constraint,<br />not just a visual metaphor.</p></div><div className="module-grid"><article className="module-card"><div className="module-number">01</div><div className="module-icon"><Braces size={19} /></div><h3>Data ingestion<br /><span>& chunking</span></h3><p>Parse SEC EDGAR XBRL into clean, typed facts. Preserve filing, page, and period metadata through semantic chunking.</p><div className="module-tags"><span>EDGAR</span><span>XBRL</span><span>PYTHON</span></div></article><article className="module-card"><div className="module-number">02</div><div className="module-icon amber-icon"><Layers3 size={19} /></div><h3>Vector<br /><span>embeddings</span></h3><p>Transform chunks into dense vectors and store them beside their provenance in a Supabase pgvector table.</p><div className="module-tags"><span>PGVECTOR</span><span>384D</span><span>SUPABASE</span></div></article><article className="module-card"><div className="module-number">03</div><div className="module-icon violet-icon"><Network size={19} /></div><h3>Retrieval<br /><span>& inference</span></h3><p>Expand the question, retrieve in parallel, then pass grounded context to Groq LPU and FinBERT.</p><div className="module-tags"><span>GROQ LPU</span><span>FINBERT</span><span>RERANK</span></div></article></div></section>
        <section className="telemetry-section"><div className="section-heading compact"><div><p className="kicker"><span>04</span> OBSERVABILITY / LIVE SIGNALS</p><h2>See the system think.</h2></div><p className="section-note">Every answer leaves a trail.<br />Inspect the checks behind it.</p></div><div className="telemetry-grid"><article className="telemetry-card telemetry-wide"><div className="telemetry-card-head"><span>QUERY CONSOLE</span><span className="live-dot" /></div><label htmlFor="rag-query">TEST A FINANCIAL QUESTION</label><form className="query-row" onSubmit={(event) => { event.preventDefault(); runQuery() }}><input id="rag-query" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Financial question" /><button type="submit" aria-label="Run query"><Play size={13} fill="currentColor" /> {playing ? 'RUNNING' : 'RUN'}</button></form><div className="query-modes">{['semantic', 'hybrid', 'strict evidence'].map((mode) => <button key={mode} type="button" className={queryMode === mode ? 'mode-active' : ''} onClick={() => setQueryMode(mode)}>{mode}</button>)}</div><p className="query-result" aria-live="polite"><Search size={14} /> {playing ? `Routing “${lastRunQuery}” through ${queryMode} retrieval…` : `“${lastRunQuery}” → ${queryMode} retrieval returned`} <strong>{playing ? 'processing live' : `${queryStats.chunks} grounded chunks`}</strong>{!playing && ` with ${queryStats.confidence} confidence.`}</p></article><article className="telemetry-card"><div className="telemetry-card-head"><span>RUN METRICS</span><Gauge size={15} /></div><div className="metric-list"><div><span>RETRIEVAL RECALL</span><strong>{queryStats.grounded ? '94.8%' : '68.2%'}</strong></div><div><span>GROUNDED CHUNKS</span><strong>{queryStats.chunks}</strong></div><div><span>ANSWER LATENCY</span><strong>{queryStats.latency} ms</strong></div><div><span>SENTIMENT</span><strong className="positive">{queryStats.sentiment}</strong></div></div></article><article className="telemetry-card"><div className="telemetry-card-head"><span>EVIDENCE TRACE</span><Check size={15} /></div><div className="trace-list"><span><i /> 10-K / FY24 / p. 42</span><span><i /> XBRL / GrossProfit</span><span><i /> FinBERT / 0.78 positive</span><span><i /> Groq / grounded response</span></div></article></div></section>
        <footer className="footer"><span>FINSIGHT / ARCHITECTURE NOTES</span><span><Check size={14} /> SOURCE-GROUNDED BY DESIGN</span><span>© 2024 — 2025</span></footer>
      </div>
    </main>
  )
}
