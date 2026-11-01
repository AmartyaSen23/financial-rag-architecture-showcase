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

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="aurora aurora-one" /><div className="aurora aurora-two" />
      <div className="site-shell">
        <header className="topbar"><a className="brand" href="#top" aria-label="FinSight architecture home"><span className="brand-mark"><CircleDot size={16} /></span><span>FINSIGHT <em>/ RAG SYSTEM</em></span></a><div className="header-meta"><span className="status-dot" /> SYSTEM ONLINE <span className="meta-divider" /> LIVE PLAYGROUND</div></header>

        <section id="top" className="hero-grid hero-updated"><div className="hero-copy"><p className="kicker"><span>01</span> FINANCIAL INTELLIGENCE / SYSTEM PLAYGROUND</p><h1>Make the<br /><span>signal move.</span></h1><p className="hero-lede">Reorder the architecture, then play the pipeline. Watch a financial query travel from SEC evidence to a grounded answer.</p><a className="scroll-cue" href="#pipeline"><ArrowDown size={15} /> Enter the simulator</a></div><div className="hero-readout pulse-readout"><div className="readout-label">LIVE SYSTEM READOUT</div><div className="readout-value">RAG<span>_</span>FIN-01</div><div className="readout-rule" /><div className="readout-grid"><span>FLOW STATE</span><strong>{flowLabel}</strong><span>PIPELINE HEALTH</span><strong className={health.tone === 'bad' ? 'amber-text' : ''}>{health.value}</strong></div></div></section>

        <section id="pipeline" className="architecture-section"><div className="section-heading"><div><p className="kicker"><span>02</span> ARCHITECTURE / LIVE SIMULATOR</p><h2>Move the evidence.</h2></div><p className="section-note">Drag a stage to reorder the workflow.<br />Then press play to trace the signal.</p></div>
          <div className="simulator-bar"><div><span className="live-dot" /> {flowLabel}</div><div className="simulator-actions"><button className="play-button" onClick={playFlow} disabled={playing}><Play size={14} fill="currentColor" /> {playing ? 'RUNNING' : 'PLAY FLOW'}</button><button className="reset-button" onClick={() => { setOrder(defaultOrder); setFlowIndex(-1); setPlaying(false); setActive('ingestion') }}><RotateCcw size={14} /> RESET</button></div></div>
          <div className="architecture-board interactive-board"><div className="board-topline"><span>QUERY-TO-ANSWER PIPELINE / DRAG TO REWIRE</span><span><span className="cyan-text">●</span> {health.value}</span></div><div className="reorder-grid">{order.map((id, index) => <div key={id} className="stage-slot"><StageCard stage={stageData[id]} index={index} active={active === id} running={playing && flowIndex === index} onHover={() => setActive(id)} onDragStart={() => setDragged(id)} onDrop={() => dragged && moveStage(dragged, id)} />{index < order.length - 1 && <div className={`flow-connector ${playing && flowIndex > index ? 'flow-complete' : ''}`}><span className="flow-particle" /><ArrowRight size={18} /><small>{index === 0 ? 'EMBED' : 'GROUND'}</small></div>}</div>)}</div><div className="board-footer"><span><span className="cyan-text">●</span> MOVING DATA CHANNEL</span><span>SEC EDGAR → SUPABASE → GROQ / FINBERT</span></div></div>
        </section>

        <section className="detail-section live-detail" aria-live="polite"><div className={`detail-marker marker-${activeStage.accent}`}><ActiveIcon size={18} /><span>{activeStage.step}</span></div><div className="detail-main"><p className="kicker">{flowIndex >= 0 ? 'LIVE TELEMETRY' : 'TECHNICAL EXPLANATION'}</p><h2>{activeStage.title}</h2><p>{activeStage.short}</p><div className={`outcome ${health.tone}`}><Sparkles size={14} /> {health.tone === 'good' ? activeStage.good : activeStage.bad}</div></div><div className="detail-spec"><span>IMPLEMENTATION</span><strong>{activeStage.detail}</strong><span className="spec-arrow"><Zap size={15} /> {flowIndex === order.indexOf(active) ? 'processing now' : 'hover a stage to inspect'}</span></div></section>

        <section className="modules-section"><div className="section-heading compact"><div><p className="kicker"><span>03</span> SYSTEM MODULES / EXPLAINED</p><h2>Built for evidence.</h2></div><p className="section-note">The canonical path is a constraint,<br />not just a visual metaphor.</p></div><div className="module-grid"><article className="module-card"><div className="module-number">01</div><div className="module-icon"><Braces size={19} /></div><h3>Data ingestion<br /><span>& chunking</span></h3><p>Parse SEC EDGAR XBRL into clean, typed facts. Preserve filing, page, and period metadata through semantic chunking.</p><div className="module-tags"><span>EDGAR</span><span>XBRL</span><span>PYTHON</span></div></article><article className="module-card"><div className="module-number">02</div><div className="module-icon amber-icon"><Layers3 size={19} /></div><h3>Vector<br /><span>embeddings</span></h3><p>Transform chunks into dense vectors and store them beside their provenance in a Supabase pgvector table.</p><div className="module-tags"><span>PGVECTOR</span><span>384D</span><span>SUPABASE</span></div></article><article className="module-card"><div className="module-number">03</div><div className="module-icon violet-icon"><Network size={19} /></div><h3>Retrieval<br /><span>& inference</span></h3><p>Expand the question, retrieve in parallel, then pass grounded context to Groq LPU and FinBERT.</p><div className="module-tags"><span>GROQ LPU</span><span>FINBERT</span><span>RERANK</span></div></article></div></section>
        <footer className="footer"><span>FINSIGHT / ARCHITECTURE NOTES</span><span><Check size={14} /> SOURCE-GROUNDED BY DESIGN</span><span>© 2024 — 2025</span></footer>
      </div>
    </main>
  )
}
