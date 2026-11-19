

export function QrVisual({ className }: { className?: string }) {
  // Deterministic decorative pattern that reads as a QR code. Grid: 21x21 modules.
  const size = 21;
  const cells: boolean[][] = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 > 0.5;
  };
  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) =>
      r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
  };
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      if (isFinder(r, c)) {
        const rr = r < 7 ? r : r - (size - 7);
        const cc = c < 7 ? c : c - (size - 7);
        const ring = Math.max(Math.abs(rr - 3), Math.abs(cc - 3));
        row.push(ring !== 2);
      } else {
        row.push(rand());
      }
    }
    cells.push(row);
  }

  return (
<div className={`grid aspect-square w-full ${className || ''}`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {cells.flatMap((row, r) =>
        row.map((on, c) => (
          <div key={`${r}-${c}`} className={on ? 'bg-navy-900' : 'bg-white'} />
        ))
      )}
    </div>
  );
}
