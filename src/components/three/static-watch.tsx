/** Inline alternative: no asset download or WebGL required. */
export function StaticWatch() {
  return <svg className="scene-static" viewBox="0 0 480 360" aria-hidden="true" focusable="false">
    <g transform="translate(240 180) rotate(-9)">
      <rect x="-26" y="-147" width="52" height="294" rx="5" fill="#594332" stroke="#8b7154" />
      {[-1, 1].map(side => <g key={side}>
        <rect x="-36" y={side === 1 ? 46 : -77} width="9" height="31" rx="2" fill="#b89b67" />
        <rect x="27" y={side === 1 ? 46 : -77} width="9" height="31" rx="2" fill="#b89b67" />
      </g>)}
      <rect x="60" y="-8" width="15" height="16" rx="3" fill="#c8ad78" />
      <circle cy="3" r="63" fill="#87724f" />
      <circle r="62" fill="#c8ad78" stroke="#e5d1a8" strokeWidth="2" />
      <circle r="53" fill="#202c2b" stroke="#8d7854" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, index) => <path key={index} d="M0 -43v-7" transform={'rotate(' + index * 30 + ')'} stroke="#eee1c4" strokeWidth={index % 3 === 0 ? 3 : 2} />)}
      <path d="M0 0 -25 -15M0 0 34 -20" fill="none" stroke="#eee1c4" strokeWidth="3" strokeLinecap="round" />
      <path d="m5 -9-23 45" stroke="#cfa479" strokeWidth="1" />
      <circle r="4" fill="#c8ad78" />
      <path d="M-38 -31a49 49 0 0 1 48-16" fill="none" stroke="#e1ecea" strokeOpacity=".18" strokeWidth="2" />
    </g>
  </svg>;
}
