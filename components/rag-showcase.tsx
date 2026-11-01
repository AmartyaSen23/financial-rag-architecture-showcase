'use client'

import { useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Braces,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  FileJson,
  Gauge,
  Layers3,
  Network,
  Search,
  ServerCog,
  Sparkles,
  Workflow,
} from 'lucide-react'

const nodes = {
  ingestion: {
    eyebrow: '01 / ingest',
    title: 'Ingestion',
    description: 'SEC EDGAR filings are parsed into typed, traceable financial facts.',
    detail: 'XBRL parser → normalized facts → semantic chunks',
    icon: FileJson,
    color: 'cyan',
  },
  database: {
    eyebrow: '02 / store',
    title: 'Database',
    description: 'Embeddings land in Supabase pgvector with metadata for precise filtering.',
    detail: '384 dimensions · cosine distance · row-level metadata',
    icon: Database,
    color: 'amber',
  },
  llm: {
    eyebrow: '03 / infer',
    title: 'LLM + FinBERT',
    description: 'Multi-query retrieval grounds Groq LPU inference and sentiment signals.',
    detail: 'parallel search → rerank → answer + sentiment',
    icon: BrainCircuit,
    color: 'violet',
  },
} as const

type NodeKey = keyof typeof nodes

function PipelineNode({ id, active, onHover, onFocus }: { id: NodeKey; active: boolean; onHover: (id: NodeKey) => void; onFocus: (id: NodeKey) => void }) {
  const node = nodes[id]
  const Icon = node.icon
  return (
    <button
      type="button"
      className={`pipeline-node node-${node.color} ${active ? 'is-active' : ''}`}
      onMouseEnter={() => onHover(id)}
      onFocus={() => onFocus(id)}
      onClick={() => onFocus(id)}
      aria-pressed={active}
      aria-label={`Highlight ${node.title} architecture node`}
    >
      <span className="node-icon"><Icon size={20} strokeWidth={1.6} /></span>
      <span className="node-copy">
        <span className="node-eyebrow">{node.eyebrow}</span>
        <strong>{node.title}</strong>
        <span>{node.description}</span>
      </span>
      <ChevronRight className="node-chevron" size={16} />
    </button>
  )
}

export default function RagShowcase() {
  const [activeNode, setActiveNode] = useState<NodeKey>('ingestion')
  const active = nodes[activeNode]
  const ActiveIcon = active.icon

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="site-shell">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="FinSight architecture home">
            <span className="brand-mark"><CircleDot size={16} /></span>
            <span>FINSIGHT <em>/ RAG SYSTEM</em></span>
          </a>
          <div className="header-meta"><span className="status-dot" /> SYSTEM ONLINE <span className="meta-divider" /> ARCH v1.0.4</div>
        </header>

        <section id="top" className="hero-grid">
          <div className="hero-copy">
            <p className="kicker"><span>01</span> FINANCIAL INTELLIGENCE / SYSTEM MAP</p>
            <h1>From filing<br /><span>to signal.</span></h1>
            <p className="hero-lede">A grounded retrieval architecture for asking better questions of public company data.</p>
            <a className="scroll-cue" href="#pipeline"><ArrowDown size={15} /> Explore the pipeline</a>
          </div>
          <div className="hero-readout">
            <div className="readout-label">LIVE SYSTEM READOUT</div>
            <div className="readout-value">RAG<span>_</span>FIN-01</div>
            <div className="readout-rule" />
            <div className="readout-grid"><span>LATENCY</span><strong>184 ms</strong><span>CONTEXT WINDOW</span><strong>32k tokens</strong></div>
          </div>
        </section>

        <section id="pipeline" className="architecture-section">
          <div className="section-heading">
            <div><p className="kicker"><span>02</span> ARCHITECTURE / INTERACTIVE MAP</p><h2>Trace the signal.</h2></div>
            <p className="section-note">Hover or focus a node to reveal<br className="hidden sm:block" /> its technical role.</p>
          </div>

          <div className="architecture-board">
            <div className="board-topline"><span>QUERY-TO-ANSWER PIPELINE</span><span>01 — 03 <span className="cyan-text">●</span></span></div>
            <div className="board-grid">
              <div className="board-intro"><span className="large-index">/ 00</span><p>One query.<br /><strong>Three layers.</strong></p><span className="board-caption">HOVER TO INSPECT</span></div>
              <div className="pipeline-visual" aria-label="Financial RAG architecture diagram">
                <div className="visual-line line-one" /><div className="visual-line line-two" />
                <PipelineNode id="ingestion" active={activeNode === 'ingestion'} onHover={setActiveNode} onFocus={setActiveNode} />
                <div className="connector connector-one"><ArrowRight size={18} /><span>parse + chunk</span></div>
                <PipelineNode id="database" active={activeNode === 'database'} onHover={setActiveNode} onFocus={setActiveNode} />
                <div className="connector connector-two"><ArrowRight size={18} /><span>retrieve + rank</span></div>
                <PipelineNode id="llm" active={activeNode === 'llm'} onHover={setActiveNode} onFocus={setActiveNode} />
              </div>
            </div>
            <div className="board-footer"><span><span className="cyan-text">●</span> ACTIVE PATH</span><span>SUPABASE / GROQ / HUGGING FACE</span></div>
          </div>
        </section>

        <section className="detail-section" aria-live="polite">
          <div className="detail-marker"><ActiveIcon size={18} /><span>{active.eyebrow}</span></div>
          <div className="detail-main"><p className="kicker">TECHNICAL EXPLANATION</p><h2>{active.title}</h2><p>{active.description}</p></div>
          <div className="detail-spec"><span>IMPLEMENTATION</span><strong>{active.detail}</strong><span className="spec-arrow"><ArrowRight size={15} /> {activeNode === 'ingestion' ? 'schema aware' : activeNode === 'database' ? 'metadata first' : 'grounded output'}</span></div>
        </section>

        <section className="modules-section">
          <div className="section-heading compact"><div><p className="kicker"><span>03</span> SYSTEM MODULES / FLOW</p><h2>Built for evidence.</h2></div><p className="section-note">Every answer carries a path<br />back to the source.</p></div>
          <div className="module-grid">
            <article className="module-card"><div className="module-number">01</div><div className="module-icon"><Braces size={19} /></div><h3>Data ingestion<br /><span>& chunking</span></h3><p>Parse SEC EDGAR XBRL into clean, typed facts. Preserve filing, page, and period metadata through semantic chunking.</p><div className="module-tags"><span>EDGAR</span><span>XBRL</span><span>PYTHON</span></div></article>
            <article className="module-card"><div className="module-number">02</div><div className="module-icon amber-icon"><Layers3 size={19} /></div><h3>Vector<br /><span>embeddings</span></h3><p>Transform chunks into dense vectors and store them beside their provenance in a Supabase pgvector table.</p><div className="module-tags"><span>PGVECTOR</span><span>384D</span><span>SUPABASE</span></div></article>
            <article className="module-card"><div className="module-number">03</div><div className="module-icon violet-icon"><Network size={19} /></div><h3>Retrieval<br /><span>& inference</span></h3><p>Expand the question, retrieve in parallel, then pass grounded context to Groq LPU and FinBERT.</p><div className="module-tags"><span>GROQ LPU</span><span>FINBERT</span><span>RERANK</span></div></article>
          </div>
        </section>

        <footer className="footer"><span>FINSIGHT / ARCHITECTURE NOTES</span><span><Check size={14} /> SOURCE-GROUNDED BY DESIGN</span><span>© 2024 — 2025</span></footer>
      </div>
    </main>
  )
}
