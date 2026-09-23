import React, { useState } from 'react';
import { Eye, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function MiningDiagram({ type, caption, data = {} }) {
  const [activeSubTab, setActiveSubTab] = useState('default');
  const [zoom, setZoom] = useState(1);

  const resetZoom = () => setZoom(1);
  const zoomIn = () => setZoom((z) => Math.min(1.8, z + 0.15));
  const zoomOut = () => setZoom((z) => Math.max(0.7, z - 0.15));

  const renderContent = () => {
    switch (type) {
      case 'BLAST_GEOMETRY':
        return <BlastGeometryDiagram />;
      case 'CUT_PATTERNS':
        return <CutPatternsDiagram subTab={activeSubTab} onTabChange={setActiveSubTab} />;
      case 'KIRSCH_STRESS':
        return <KirschStressDiagram />;
      case 'MOHR_CIRCLE':
        return <MohrCircleDiagram />;
      case 'SLOPE_PLANAR_FAILURE':
        return <SlopePlanarFailureDiagram />;
      case 'HYDRAULIC_PROP_CURVE':
        return <HydraulicPropCurveDiagram />;
      case 'EVASEE_DUCT':
        return <EvaseeDuctDiagram />;
      case 'VENTILATION_SPLIT':
        return <VentilationSplitDiagram />;
      case 'VARIOGRAM_MODELS':
        return <VariogramModelsDiagram subTab={activeSubTab} onTabChange={setActiveSubTab} />;
      case 'POLYGON_AREA':
        return <PolygonAreaDiagram />;
      case 'BENCH_PIT_GEOMETRY':
        return <BenchPitGeometryDiagram />;
      case 'UNDERWATER_BLASTING_TREE':
        return <UnderwaterBlastingTreeDiagram />;
      default:
        return <DefaultMiningDiagram caption={caption} />;
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        margin: '20px 0',
        padding: '16px',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={18} color="var(--accent-blue)" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
            ઈજનેરી આકૃતિ (GATE MN Engineering Schematic)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="btn btn-sm btn-secondary"
            style={{ padding: '4px 8px', minHeight: '28px' }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetZoom}
            title="Reset Zoom"
            className="btn btn-sm btn-secondary"
            style={{ padding: '4px 8px', minHeight: '28px' }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="btn btn-sm btn-secondary"
            style={{ padding: '4px 8px', minHeight: '28px' }}
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 0',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {renderContent()}
      </div>

      {caption && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px dashed var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Info size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
          <span>{caption}</span>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// 1. BLAST GEOMETRY DIAGRAM (Burden, Spacing, Bench Height, Stemming, Subgrade)
// --------------------------------------------------------------------------
function BlastGeometryDiagram() {
  return (
    <svg width="620" height="340" viewBox="0 0 620 340" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <pattern id="rockHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--border-card)" strokeWidth="1" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-blue)" />
        </marker>
        <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
      </defs>

      {/* Upper Crest and Free Face Bench Profile */}
      <path
        d="M 20 40 L 320 40 L 400 240 L 590 240 L 590 310 L 20 310 Z"
        fill="var(--bg-card)"
        stroke="var(--text-main)"
        strokeWidth="2.5"
      />
      <path
        d="M 20 40 L 320 40 L 400 240 L 590 240 L 590 310 L 20 310 Z"
        fill="url(#rockHatch)"
        opacity="0.6"
      />

      {/* Free Face Label & Arrow */}
      <text x="440" y="140" fill="#ef4444" fontWeight="700" fontSize="13">
        Free Face (મુક્ત સપાટી)
      </text>
      <line x1="430" y1="145" x2="375" y2="170" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />

      {/* Vertical Blast Hole */}
      <rect x="230" y="40" width="22" height="230" fill="var(--bg-secondary)" stroke="var(--text-main)" strokeWidth="2" />

      {/* Collar Stemming (T) */}
      <rect x="231" y="41" width="20" height="75" fill="#f59e0b" opacity="0.85" />
      <text x="241" y="80" fill="#000" fontWeight="700" fontSize="10" textAnchor="middle">
        STEMMING (T)
      </text>

      {/* Explosive Column (Charge Length Lc) */}
      <rect x="231" y="116" width="20" height="124" fill="#dc2626" opacity="0.9" />
      <text x="241" y="180" fill="#fff" fontWeight="800" fontSize="11" textAnchor="middle" transform="rotate(-90 241 180)">
        EXPLOSIVE (Lc)
      </text>

      {/* Subgrade Drilling (J = 8D to 10D) */}
      <rect x="231" y="240" width="20" height="30" fill="#64748b" opacity="0.9" />
      <text x="241" y="258" fill="#fff" fontWeight="700" fontSize="9" textAnchor="middle">
        SUB (J)
      </text>

      {/* Pit Floor */}
      <line x1="200" y1="240" x2="590" y2="240" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="5,5" />
      <text x="500" y="232" fill="#3b82f6" fontWeight="700" fontSize="11">
        Pit Floor / Grade Level
      </text>

      {/* Dimension Line: Burden B */}
      <line x1="241" y1="25" x2="320" y2="25" stroke="var(--accent-blue)" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x="280" y="18" fill="var(--accent-blue)" fontWeight="800" fontSize="12" textAnchor="middle">
        Burden (B)
      </text>

      {/* Dimension Line: Bench Height H */}
      <line x1="160" y1="40" x2="160" y2="240" stroke="var(--accent-blue)" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x="145" y="145" fill="var(--accent-blue)" fontWeight="800" fontSize="13" textAnchor="end">
        Bench Height (H)
      </text>

      {/* Dimension Line: Subgrade drilling (J) */}
      <line x1="185" y1="240" x2="185" y2="270" stroke="#64748b" strokeWidth="1.8" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x="175" y="258" fill="#64748b" fontWeight="700" fontSize="10" textAnchor="end">
        Sub-grade (J)
      </text>

      {/* Dimension Line: Stemming length */}
      <line x1="265" y1="40" x2="265" y2="116" stroke="#f59e0b" strokeWidth="1.8" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x="272" y="82" fill="#f59e0b" fontWeight="700" fontSize="10">
        Stemming T ≈ 25·D
      </text>

      {/* Formulas Box */}
      <g transform="translate(380, 20)">
        <rect x="0" y="0" width="220" height="90" rx="8" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />
        <text x="10" y="20" fill="var(--text-main)" fontWeight="800" fontSize="11">
          GATE Key Equations:
        </text>
        <text x="10" y="38" fill="var(--text-muted)" fontSize="10.5">
          • Vol = B × S × H (m³)
        </text>
        <text x="10" y="55" fill="var(--text-muted)" fontSize="10.5">
          • PF = Rock Vol / Explosive (m³/kg)
        </text>
        <text x="10" y="73" fill="var(--text-muted)" fontSize="10.5">
          • Lc = (H + J) - Stemming
        </text>
      </g>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 2. CUT PATTERNS DIAGRAM (Pyramid cut, Burn cut, Wedge cut, Drag cut)
// --------------------------------------------------------------------------
function CutPatternsDiagram({ subTab, onTabChange }) {
  const currentTab = subTab === 'default' ? 'pyramid' : subTab;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { id: 'pyramid', label: 'Pyramid Cut (GATE 2023 Q6)' },
          { id: 'burn', label: 'Burn Cut (Parallel Relief)' },
          { id: 'wedge', label: 'Wedge (V) Cut' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`btn btn-sm ${currentTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '5px 12px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <svg width="580" height="300" viewBox="0 0 580 300" style={{ maxWidth: '100%', height: 'auto' }}>
        {currentTab === 'pyramid' && (
          <g>
            {/* Front View */}
            <rect x="40" y="40" width="200" height="200" rx="4" fill="var(--bg-card)" stroke="var(--text-main)" strokeWidth="2" />
            <text x="140" y="25" fill="var(--text-main)" fontWeight="700" fontSize="13" textAnchor="middle">
              Front View (Coal Face)
            </text>

            <circle cx="70" cy="70" r="5" fill="var(--accent-blue)" />
            <circle cx="210" cy="70" r="5" fill="var(--accent-blue)" />
            <circle cx="70" cy="210" r="5" fill="var(--accent-blue)" />
            <circle cx="210" cy="210" r="5" fill="var(--accent-blue)" />
            <circle cx="140" cy="65" r="5" fill="var(--accent-blue)" />
            <circle cx="140" cy="215" r="5" fill="var(--accent-blue)" />

            <circle cx="110" cy="110" r="6" fill="#ef4444" />
            <circle cx="170" cy="110" r="6" fill="#ef4444" />
            <circle cx="110" cy="170" r="6" fill="#ef4444" />
            <circle cx="170" cy="170" r="6" fill="#ef4444" />

            <line x1="110" y1="110" x2="140" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="170" y1="110" x2="140" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="110" y1="170" x2="140" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="170" y1="170" x2="140" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
            <circle cx="140" cy="140" r="3" fill="#f59e0b" />
            <text x="140" y="260" fill="#ef4444" fontWeight="700" fontSize="11" textAnchor="middle">
              4 Cut Holes converging to Apex
            </text>

            <g transform="translate(310, 40)">
              <rect x="0" y="0" width="220" height="200" rx="4" fill="var(--bg-card)" stroke="var(--text-main)" strokeWidth="2" />
              <text x="110" y="-15" fill="var(--text-main)" fontWeight="700" fontSize="13" textAnchor="middle">
                Side View (Depth Profile)
              </text>
              <line x1="0" y1="40" x2="180" y2="100" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="0" y1="160" x2="180" y2="100" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="0" y1="15" x2="170" y2="15" stroke="var(--accent-blue)" strokeWidth="2" strokeDasharray="4,4" />
              <line x1="0" y1="185" x2="170" y2="185" stroke="var(--accent-blue)" strokeWidth="2" strokeDasharray="4,4" />
              <circle cx="180" cy="100" r="4" fill="#f59e0b" />
              <text x="190" y="104" fill="#f59e0b" fontWeight="800" fontSize="11">
                Apex Point
              </text>
              <text x="5" y="195" fill="var(--text-muted)" fontSize="10">
                Face Boundary
              </text>
            </g>
          </g>
        )}

        {currentTab === 'burn' && (
          <g>
            <rect x="140" y="40" width="300" height="220" rx="6" fill="var(--bg-card)" stroke="var(--text-main)" strokeWidth="2" />
            <text x="290" y="25" fill="var(--text-main)" fontWeight="700" fontSize="13" textAnchor="middle">
              Burn Cut: Parallel Holes Perpendicular to Face
            </text>
            <circle cx="290" cy="150" r="18" fill="none" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="290" cy="150" r="2" fill="#f59e0b" />
            <text x="290" y="185" fill="#f59e0b" fontWeight="700" fontSize="11" textAnchor="middle">
              Uncharged Reamer Hole (Void)
            </text>

            <circle cx="240" cy="150" r="8" fill="#ef4444" />
            <circle cx="340" cy="150" r="8" fill="#ef4444" />
            <circle cx="290" cy="100" r="8" fill="#ef4444" />
            <circle cx="290" cy="200" r="8" fill="#ef4444" />

            <circle cx="255" cy="115" r="7" fill="#3b82f6" />
            <circle cx="325" cy="115" r="7" fill="#3b82f6" />
            <circle cx="255" cy="185" r="7" fill="#3b82f6" />
            <circle cx="325" cy="185" r="7" fill="#3b82f6" />

            <text x="290" y="278" fill="var(--text-muted)" fontSize="11" textAnchor="middle">
              All holes are drilled 90° (at right angles) to the tunnel face (GATE 2016 Q25).
            </text>
          </g>
        )}

        {currentTab === 'wedge' && (
          <g>
            <rect x="120" y="30" width="340" height="230" rx="6" fill="var(--bg-card)" stroke="var(--text-main)" strokeWidth="2" />
            <text x="290" y="20" fill="var(--text-main)" fontWeight="700" fontSize="13" textAnchor="middle">
              Wedge (V) Cut Pattern
            </text>
            <line x1="160" y1="70" x2="290" y2="145" stroke="#ef4444" strokeWidth="3" />
            <line x1="420" y1="70" x2="290" y2="145" stroke="#ef4444" strokeWidth="3" />
            <line x1="160" y1="130" x2="290" y2="145" stroke="#ef4444" strokeWidth="3" />
            <line x1="420" y1="130" x2="290" y2="145" stroke="#ef4444" strokeWidth="3" />
            <line x1="160" y1="190" x2="290" y2="145" stroke="#ef4444" strokeWidth="3" />
            <line x1="420" y1="190" x2="290" y2="145" stroke="#ef4444" strokeWidth="3" />
            <circle cx="290" cy="145" r="5" fill="#f59e0b" />
            <text x="290" y="170" fill="#f59e0b" fontWeight="800" fontSize="12" textAnchor="middle">
              Apex Line (V-Vertex)
            </text>
            <text x="290" y="245" fill="var(--text-muted)" fontSize="11" textAnchor="middle">
              Holes meet along a vertical line; ideal for stratified formations with high pull.
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// --------------------------------------------------------------------------
// 3. KIRSCH STRESS CONCENTRATION AROUND CIRCULAR TUNNEL
// --------------------------------------------------------------------------
function KirschStressDiagram() {
  return (
    <svg width="600" height="320" viewBox="0 0 600 320" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="karrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
        <marker id="harrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
        </marker>
      </defs>

      <line x1="200" y1="20" x2="200" y2="60" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#karrow)" />
      <line x1="230" y1="20" x2="230" y2="60" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#karrow)" />
      <line x1="260" y1="20" x2="260" y2="60" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#karrow)" />
      <text x="230" y="15" fill="#ef4444" fontWeight="800" fontSize="12" textAnchor="middle">
        Vertical Stress (Po)
      </text>

      <line x1="40" y1="160" x2="90" y2="160" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#harrow)" />
      <text x="35" y="145" fill="#3b82f6" fontWeight="800" fontSize="12">
        Horizontal Stress (k·Po)
      </text>

      <rect x="90" y="60" width="280" height="200" rx="8" fill="var(--bg-card)" stroke="var(--border-card)" strokeWidth="2" />

      <circle cx="230" cy="160" r="55" fill="var(--bg-secondary)" stroke="var(--text-main)" strokeWidth="3" />
      <text x="230" y="165" fill="var(--text-muted)" fontWeight="700" fontSize="12" textAnchor="middle">
        Tunnel (r = a)
      </text>

      <circle cx="285" cy="160" r="5" fill="#10b981" />
      <text x="300" y="165" fill="#10b981" fontWeight="800" fontSize="13">
        Point A (Sidewall)
      </text>

      <circle cx="230" cy="105" r="5" fill="#f59e0b" />
      <text x="230" y="98" fill="#f59e0b" fontWeight="800" fontSize="13" textAnchor="middle">
        Point B (Crown)
      </text>

      <g transform="translate(390, 40)">
        <rect x="0" y="0" width="200" height="230" rx="8" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />
        <text x="12" y="24" fill="var(--text-main)" fontWeight="800" fontSize="12">
          Kirsch Equations (GATE):
        </text>
        <text x="12" y="50" fill="var(--text-main)" fontWeight="700" fontSize="11">
          At Boundary (r = a):
        </text>
        <text x="12" y="70" fill="var(--text-muted)" fontSize="10">
          σθθ = Po[(1+k) + 2(1-k)cos2θ]
        </text>
        <text x="12" y="100" fill="#10b981" fontWeight="700" fontSize="11">
          Sidewall (Point A, θ = 0°):
        </text>
        <text x="12" y="118" fill="var(--text-muted)" fontSize="10.5">
          σθθ(A) = Po(3 - k)
        </text>
        <text x="12" y="148" fill="#f59e0b" fontWeight="700" fontSize="11">
          Crown/Roof (Point B, θ = 90°):
        </text>
        <text x="12" y="166" fill="var(--text-muted)" fontSize="10.5">
          σθθ(B) = Po(3k - 1)
        </text>
        <text x="12" y="196" fill="var(--accent-blue)" fontWeight="700" fontSize="10.5">
          If σθθ(A) = 3·σθθ(B):
        </text>
        <text x="12" y="214" fill="var(--accent-blue)" fontWeight="800" fontSize="11">
          ➔ k = 2 (GATE 2022)
        </text>
      </g>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 4. MOHR CIRCLE WITH PORE PRESSURE SHIFT
// --------------------------------------------------------------------------
function MohrCircleDiagram() {
  return (
    <svg width="600" height="300" viewBox="0 0 600 300" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="marrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--text-main)" />
        </marker>
        <marker id="shiftArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
      </defs>

      <line x1="50" y1="240" x2="550" y2="240" stroke="var(--text-main)" strokeWidth="2" markerEnd="url(#marrow)" />
      <line x1="80" y1="260" x2="80" y2="30" stroke="var(--text-main)" strokeWidth="2" markerEnd="url(#marrow)" />
      <text x="540" y="260" fill="var(--text-main)" fontWeight="700" fontSize="13">
        Normal Stress (σn)
      </text>
      <text x="60" y="25" fill="var(--text-main)" fontWeight="700" fontSize="13">
        Shear Stress (τ)
      </text>

      <line x1="80" y1="180" x2="480" y2="50" stroke="#dc2626" strokeWidth="2.5" />
      <text x="490" y="55" fill="#dc2626" fontWeight="800" fontSize="12">
        Failure Envelope τ = c + σn·tanφ
      </text>
      <text x="65" y="185" fill="#dc2626" fontWeight="700" fontSize="11">
        c
      </text>

      <path d="M 320 240 A 80 80 0 0 1 480 240" fill="rgba(37, 99, 235, 0.1)" stroke="var(--accent-blue)" strokeWidth="2.5" />
      <circle cx="320" cy="240" r="4" fill="var(--accent-blue)" />
      <circle cx="480" cy="240" r="4" fill="var(--accent-blue)" />
      <text x="320" y="258" fill="var(--accent-blue)" fontWeight="700" fontSize="11" textAnchor="middle">
        σ3
      </text>
      <text x="480" y="258" fill="var(--accent-blue)" fontWeight="700" fontSize="11" textAnchor="middle">
        σ1
      </text>
      <text x="400" y="145" fill="var(--accent-blue)" fontWeight="700" fontSize="12" textAnchor="middle">
        Dry Rock (Safe)
      </text>

      <path d="M 190 240 A 80 80 0 0 1 350 240" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,3" />
      <circle cx="190" cy="240" r="4" fill="#ef4444" />
      <circle cx="350" cy="240" r="4" fill="#ef4444" />
      <text x="180" y="258" fill="#ef4444" fontWeight="700" fontSize="11" textAnchor="middle">
        σ3 - p
      </text>
      <text x="360" y="258" fill="#ef4444" fontWeight="700" fontSize="11" textAnchor="middle">
        σ1 - p
      </text>
      <text x="270" y="140" fill="#ef4444" fontWeight="800" fontSize="12" textAnchor="middle">
        Saturated (Failure Induced!)
      </text>

      <line x1="390" y1="210" x2="280" y2="210" stroke="#ef4444" strokeWidth="2" markerEnd="url(#shiftArrow)" />
      <text x="335" y="202" fill="#ef4444" fontWeight="700" fontSize="11" textAnchor="middle">
        Shift = Pore Pressure (p)
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 5. SLOPE PLANAR FAILURE DIAGRAM
// --------------------------------------------------------------------------
function SlopePlanarFailureDiagram() {
  return (
    <svg width="580" height="300" viewBox="0 0 580 300" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="sarrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
        <marker id="barrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-blue)" />
        </marker>
      </defs>

      <path
        d="M 60 250 L 220 250 L 380 60 L 520 60"
        fill="none"
        stroke="var(--text-main)"
        strokeWidth="3"
      />

      <line x1="160" y1="250" x2="430" y2="60" stroke="#f59e0b" strokeWidth="3" />
      <text x="445" y="65" fill="#f59e0b" fontWeight="800" fontSize="12">
        Joint Plane (Dip = β)
      </text>

      <rect x="360" y="60" width="12" height="60" fill="#3b82f6" opacity="0.8" />
      <text x="375" y="95" fill="#3b82f6" fontWeight="700" fontSize="11">
        Tension Crack (Water zw)
      </text>

      <line x1="300" y1="120" x2="300" y2="190" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#sarrow)" />
      <text x="310" y="165" fill="#ef4444" fontWeight="800" fontSize="13">
        Weight (W)
      </text>

      <line x1="280" y1="160" x2="245" y2="120" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#barrow)" />
      <text x="215" y="125" fill="#3b82f6" fontWeight="800" fontSize="12">
        Uplift (U)
      </text>

      <line x1="250" y1="200" x2="350" y2="110" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4,2" />
      <text x="360" y="115" fill="#10b981" fontWeight="800" fontSize="12">
        Rock Bolt (T)
      </text>

      <rect x="50" y="240" width="480" height="50" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
      <text x="290" y="260" fill="var(--text-main)" fontWeight="700" fontSize="11.5" textAnchor="middle">
        Factor of Safety (FOS) = [ c·A + (W·cosβ - U + T)·tanφ ] / [ W·sinβ ]
      </text>
      <text x="290" y="278" fill="var(--text-muted)" fontSize="10.5" textAnchor="middle">
        GATE 2012, 2014 & 2019: Rock bolting increases normal confinement and prevents sliding.
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 6. HYDRAULIC PROP LOAD-DEFORMATION CURVE (GATE 2026 Q99)
// --------------------------------------------------------------------------
function HydraulicPropCurveDiagram() {
  return (
    <svg width="580" height="280" viewBox="0 0 580 280" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="parrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--text-main)" />
        </marker>
      </defs>

      <line x1="60" y1="230" x2="520" y2="230" stroke="var(--text-main)" strokeWidth="2" markerEnd="url(#parrow)" />
      <line x1="60" y1="230" x2="60" y2="30" stroke="var(--text-main)" strokeWidth="2" markerEnd="url(#parrow)" />
      <text x="500" y="250" fill="var(--text-main)" fontWeight="700" fontSize="12">
        Deformation / Convergence (mm)
      </text>
      <text x="70" y="30" fill="var(--text-main)" fontWeight="700" fontSize="12">
        Support Load (N / kN)
      </text>

      <path d="M 60 230 L 160 80 L 480 80" fill="none" stroke="#10b981" strokeWidth="3.5" />
      <text x="495" y="85" fill="#10b981" fontWeight="800" fontSize="14">
        (S) Ideal Hydraulic Prop
      </text>
      <line x1="60" y1="80" x2="160" y2="80" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
      <text x="15" y="85" fill="#10b981" fontWeight="700" fontSize="11">
        Yield Load
      </text>

      <path d="M 60 230 Q 200 120 480 95" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,4" />
      <text x="495" y="102" fill="#f59e0b" fontWeight="700" fontSize="12">
        (R) Friction Prop
      </text>

      <path d="M 60 230 L 140 100 L 320 220" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" />
      <text x="330" y="215" fill="#ef4444" fontWeight="700" fontSize="12">
        (P) Brittle Failure
      </text>

      <rect x="180" y="130" width="280" height="65" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
      <text x="190" y="152" fill="var(--text-main)" fontWeight="700" fontSize="11">
        GATE 2026 Question 99 Key Concept:
      </text>
      <text x="190" y="170" fill="var(--text-muted)" fontSize="10.5">
        The ideal hydraulic prop rapidly achieves rated yield load
      </text>
      <text x="190" y="185" fill="var(--text-muted)" fontSize="10.5">
        and remains horizontal (constant yield resistance).
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 7. EVASEE DUCT DIAGRAM (Exhaust Fan Pressure Regain)
// --------------------------------------------------------------------------
function EvaseeDuctDiagram() {
  return (
    <svg width="580" height="260" viewBox="0 0 580 260" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="earrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-blue)" />
        </marker>
      </defs>

      <circle cx="100" cy="130" r="45" fill="var(--bg-card)" stroke="var(--text-main)" strokeWidth="2.5" />
      <circle cx="100" cy="130" r="14" fill="#3b82f6" />
      <text x="100" y="134" fill="#fff" fontWeight="800" fontSize="10" textAnchor="middle">
        FAN
      </text>

      <path
        d="M 145 105 L 380 45 L 380 215 L 145 155 Z"
        fill="rgba(37, 99, 235, 0.12)"
        stroke="var(--accent-blue)"
        strokeWidth="2.5"
      />

      <line x1="160" y1="130" x2="220" y2="130" stroke="var(--accent-blue)" strokeWidth="3" markerEnd="url(#earrow)" />
      <text x="180" y="120" fill="var(--accent-blue)" fontWeight="800" fontSize="12">
        v1 (High)
      </text>
      <text x="150" y="175" fill="var(--text-muted)" fontSize="10">
        Inlet Area A1
      </text>

      <line x1="390" y1="130" x2="470" y2="130" stroke="#10b981" strokeWidth="3" markerEnd="url(#earrow)" />
      <text x="420" y="120" fill="#10b981" fontWeight="800" fontSize="12">
        v2 (Low)
      </text>
      <text x="390" y="175" fill="var(--text-muted)" fontSize="10">
        Outlet Area A2
      </text>

      <rect x="230" y="15" width="220" height="40" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
      <text x="340" y="32" fill="var(--accent-blue)" fontWeight="800" fontSize="11" textAnchor="middle">
        ΔPs = η · ρ · (v1² - v2²) / 2
      </text>
      <text x="340" y="48" fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">
        Static Pressure Regain from Velocity Head
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 8. VENTILATION NETWORK SPLIT WITH BOOSTER FAN
// --------------------------------------------------------------------------
function VentilationSplitDiagram() {
  return (
    <svg width="580" height="240" viewBox="0 0 580 240" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="varrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--text-main)" />
        </marker>
      </defs>

      <line x1="40" y1="120" x2="140" y2="120" stroke="var(--text-main)" strokeWidth="3" markerEnd="url(#varrow)" />
      <text x="80" y="105" fill="var(--text-main)" fontWeight="800" fontSize="12">
        Total Q
      </text>

      <circle cx="140" cy="120" r="5" fill="var(--accent-blue)" />

      <path d="M 140 120 L 190 60 L 380 60 L 430 120" fill="none" stroke="var(--text-main)" strokeWidth="2.5" />
      <text x="270" y="50" fill="var(--accent-blue)" fontWeight="800" fontSize="12" textAnchor="middle">
        District A: Resistance RA, Flow QA
      </text>

      <path d="M 140 120 L 190 180 L 380 180 L 430 120" fill="none" stroke="var(--text-main)" strokeWidth="2.5" />
      <text x="240" y="205" fill="#f59e0b" fontWeight="800" fontSize="12" textAnchor="middle">
        District B: RB, QB
      </text>

      <circle cx="340" cy="180" r="16" fill="var(--bg-card)" stroke="#ef4444" strokeWidth="2.5" />
      <text x="340" y="184" fill="#ef4444" fontWeight="800" fontSize="10" textAnchor="middle">
        BOOSTER
      </text>
      <text x="340" y="218" fill="#ef4444" fontWeight="700" fontSize="11" textAnchor="middle">
        PB = ΔP(Q'B/QB)² - ΔP
      </text>

      <circle cx="430" cy="120" r="5" fill="var(--accent-blue)" />
      <line x1="430" y1="120" x2="530" y2="120" stroke="var(--text-main)" strokeWidth="3" markerEnd="url(#varrow)" />
      <text x="470" y="105" fill="var(--text-main)" fontWeight="800" fontSize="12">
        Return Q
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 9. VARIOGRAM MODELS (Spherical, Exponential, Gaussian, Pure Nugget)
// --------------------------------------------------------------------------
function VariogramModelsDiagram({ subTab, onTabChange }) {
  return (
    <svg width="580" height="280" viewBox="0 0 580 280" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="garrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--text-main)" />
        </marker>
      </defs>

      <line x1="60" y1="220" x2="520" y2="220" stroke="var(--text-main)" strokeWidth="2" markerEnd="url(#garrow)" />
      <line x1="60" y1="220" x2="60" y2="20" stroke="var(--text-main)" strokeWidth="2" markerEnd="url(#garrow)" />
      <text x="480" y="240" fill="var(--text-main)" fontWeight="700" fontSize="12">
        Lag Distance (h)
      </text>
      <text x="70" y="25" fill="var(--text-main)" fontWeight="700" fontSize="12">
        Semi-variogram γ(h)
      </text>

      <line x1="60" y1="70" x2="500" y2="70" stroke="var(--text-muted)" strokeWidth="1.8" strokeDasharray="5,4" />
      <text x="15" y="75" fill="var(--text-main)" fontWeight="800" fontSize="12">
        Sill (C)
      </text>

      <circle cx="60" cy="180" r="4" fill="#ef4444" />
      <text x="10" y="185" fill="#ef4444" fontWeight="800" fontSize="11">
        Nugget C0
      </text>

      <path d="M 60 180 Q 180 90 280 70 L 500 70" fill="none" stroke="#2563eb" strokeWidth="3" />
      <text x="290" y="60" fill="#2563eb" fontWeight="800" fontSize="11">
        Spherical: reaches sill at finite range (a)
      </text>
      <line x1="280" y1="70" x2="280" y2="220" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,3" />
      <text x="280" y="236" fill="#2563eb" fontWeight="700" fontSize="11" textAnchor="middle">
        Range (a)
      </text>

      <path d="M 60 180 Q 220 120 480 76" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6,3" />
      <text x="430" y="105" fill="#10b981" fontWeight="700" fontSize="11">
        Exponential (Asymptotic)
      </text>

      <line x1="60" y1="70" x2="500" y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
      <text x="400" y="130" fill="#f59e0b" fontWeight="700" fontSize="11">
        Pure Nugget: instantaneous sill
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 10. VORONOI POLYGON AREA-OF-INFLUENCE DIAGRAM
// --------------------------------------------------------------------------
function PolygonAreaDiagram() {
  return (
    <svg width="560" height="260" viewBox="0 0 560 260" style={{ maxWidth: '100%', height: 'auto' }}>
      <polygon points="60,40 180,20 220,120 120,160 40,110" fill="rgba(37, 99, 235, 0.15)" stroke="var(--accent-blue)" strokeWidth="2" />
      <circle cx="130" cy="90" r="6" fill="var(--accent-blue)" />
      <text x="130" y="115" fill="var(--text-main)" fontWeight="800" fontSize="11" textAnchor="middle">
        D1 (A1 = 0.02 km²)
      </text>
      <text x="130" y="130" fill="var(--accent-blue)" fontWeight="700" fontSize="10" textAnchor="middle">
        g1 = 64.5%
      </text>

      <polygon points="180,20 340,30 360,150 220,120" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" />
      <circle cx="270" cy="80" r="6" fill="#10b981" />
      <text x="270" y="105" fill="var(--text-main)" fontWeight="800" fontSize="11" textAnchor="middle">
        D2 (A2 = 0.03 km²)
      </text>
      <text x="270" y="120" fill="#10b981" fontWeight="700" fontSize="10" textAnchor="middle">
        g2 = 61.6%
      </text>

      <polygon points="220,120 360,150 340,240 160,230 120,160" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="250" cy="180" r="6" fill="#f59e0b" />
      <text x="250" y="205" fill="var(--text-main)" fontWeight="800" fontSize="11" textAnchor="middle">
        D3 (A3 = 0.04 km²)
      </text>
      <text x="250" y="220" fill="#f59e0b" fontWeight="700" fontSize="10" textAnchor="middle">
        g3 = 63.1%
      </text>

      <g transform="translate(380, 50)">
        <rect x="0" y="0" width="165" height="150" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
        <text x="10" y="24" fill="var(--text-main)" fontWeight="800" fontSize="11">
          Area-Weighted Grade:
        </text>
        <text x="10" y="55" fill="var(--accent-blue)" fontWeight="700" fontSize="10.5">
          ḡ = Σ(Ai · gi) / Σ(Ai)
        </text>
        <text x="10" y="85" fill="var(--text-muted)" fontSize="10">
          • A1·g1 = 1.29
        </text>
        <text x="10" y="102" fill="var(--text-muted)" fontSize="10">
          • A2·g2 = 1.85
        </text>
        <text x="10" y="120" fill="var(--text-muted)" fontSize="10">
          • A3·g3 = 2.52
        </text>
        <text x="10" y="140" fill="#10b981" fontWeight="800" fontSize="11">
          ➔ ḡ = 62.89% (GATE '26)
        </text>
      </g>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 11. BENCH & PIT SLOPE GEOMETRY
// --------------------------------------------------------------------------
function BenchPitGeometryDiagram() {
  return (
    <svg width="580" height="260" viewBox="0 0 580 260" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <marker id="pitarrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-blue)" />
        </marker>
      </defs>

      <path d="M 40 40 L 140 40 L 170 100 L 250 100 L 280 160 L 360 160 L 390 220 L 480 220" fill="none" stroke="var(--text-main)" strokeWidth="3" />

      <line x1="170" y1="90" x2="250" y2="90" stroke="var(--accent-blue)" strokeWidth="1.8" markerEnd="url(#pitarrow)" markerStart="url(#pitarrow)" />
      <text x="210" y="82" fill="var(--accent-blue)" fontWeight="700" fontSize="11" textAnchor="middle">
        Bench Width (W)
      </text>

      <line x1="130" y1="40" x2="130" y2="100" stroke="#f59e0b" strokeWidth="1.8" markerEnd="url(#pitarrow)" markerStart="url(#pitarrow)" />
      <text x="120" y="75" fill="#f59e0b" fontWeight="700" fontSize="11" textAnchor="end">
        Height (H)
      </text>

      <line x1="140" y1="40" x2="390" y2="220" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" />
      <text x="240" y="145" fill="#ef4444" fontWeight="800" fontSize="12">
        Overall Pit Slope Angle (α)
      </text>

      <rect x="360" y="20" width="200" height="70" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
      <text x="370" y="40" fill="var(--text-main)" fontWeight="800" fontSize="11">
        Pit Slope Formula (GATE 2025):
      </text>
      <text x="370" y="60" fill="var(--accent-blue)" fontWeight="700" fontSize="10.5">
        tan α = n·H / [ (n-1)W + nH/tanθ ]
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// 12. UNDERWATER ROCK BLASTING DECISION TREE
// --------------------------------------------------------------------------
function UnderwaterBlastingTreeDiagram() {
  return (
    <svg width="580" height="260" viewBox="0 0 580 260" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect x="170" y="15" width="240" height="40" rx="6" fill="var(--accent-blue)" />
      <text x="290" y="40" fill="#fff" fontWeight="800" fontSize="12" textAnchor="middle">
        Underwater Rock Blasting (GATE '26)
      </text>

      <line x1="240" y1="55" x2="140" y2="90" stroke="var(--text-main)" strokeWidth="2" />
      <rect x="50" y="90" width="180" height="50" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <text x="140" y="110" fill="var(--text-main)" fontWeight="700" fontSize="11" textAnchor="middle">
        Explosive Requirement:
      </text>
      <text x="140" y="128" fill="#10b981" fontWeight="800" fontSize="11" textAnchor="middle">
        Water Resistant (Emulsion)
      </text>

      <line x1="340" y1="55" x2="440" y2="90" stroke="var(--text-main)" strokeWidth="2" />
      <rect x="350" y="90" width="180" height="50" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <text x="440" y="110" fill="var(--text-main)" fontWeight="700" fontSize="11" textAnchor="middle">
        Initiator Requirement:
      </text>
      <text x="440" y="128" fill="#10b981" fontWeight="800" fontSize="11" textAnchor="middle">
        Non-Electric (Avoid Strays)
      </text>

      <line x1="140" y1="140" x2="290" y2="185" stroke="#10b981" strokeWidth="2.5" />
      <line x1="440" y1="140" x2="290" y2="185" stroke="#10b981" strokeWidth="2.5" />
      <rect x="110" y="185" width="360" height="48" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" />
      <text x="290" y="206" fill="#10b981" fontWeight="800" fontSize="13" textAnchor="middle">
        Optimal Selection: Emulsion + Non-Electric Detonator
      </text>
      <text x="290" y="222" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
        ANFO washes out in water; Electric detonators prone to stray current leakage.
      </text>
    </svg>
  );
}

// --------------------------------------------------------------------------
// DEFAULT FALLBACK DIAGRAM
// --------------------------------------------------------------------------
function DefaultMiningDiagram({ caption }) {
  return (
    <div
      style={{
        padding: '30px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        width: '100%',
      }}
    >
      <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>
        {caption || 'Mining Engineering Technical Schematic'}
      </p>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Interactive 2D/3D visual model active for this curriculum section.
      </span>
    </div>
  );
}
