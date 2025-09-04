'use client';
import { useEffect, useMemo, useState } from 'react';

// export const metadata = { title: 'NBA Weekly Schedule • FantasyEdge' };

export default function WeeklySchedulePage() {
	const [rows, setRows] = useState([]);
	const [err, setErr] = useState(null);
	const [sortBy, setSortBy] = useState('team'); // 'team' | 'totalDesc' | 'totalAsc'

	// Load from /public/data/nba_2025_weekly_games.json
	useEffect(() => {
		async function load() {
			try {
				const res = await fetch('/data/nba_2025_weekly_games.json', {
					cache: 'no-store'
				});
				if (!res.ok) throw new Error('Failed to load weekly games json');
				const data = await res.json();
				setRows(data);
			} catch (e) {
				setErr(e.message || String(e));
			}
		}
		load();
	}, []);

	const WEEKS = 23; // W1..W23 (W1 is index 0)
	const headers = useMemo(
		() => Array.from({ length: WEEKS }, (_, i) => `W${i + 1}`),
		[]
	);
	const augmented = useMemo(() => {
		return rows.map((r) => ({
			...r,
			total_23: (r.weekly_games || [])
				.slice(0, WEEKS)
				.reduce((a, b) => a + (b || 0), 0)
		}));
	}, [rows]);

	const sorted = useMemo(() => {
		if (sortBy === 'totalDesc')
			return [...augmented].sort((a, b) => b.total_23 - a.total_23);
		if (sortBy === 'totalAsc')
			return [...augmented].sort((a, b) => a.total_23 - b.total_23);
		return [...augmented].sort((a, b) => a.team.localeCompare(b.team));
	}, [augmented, sortBy]);

	if (err) {
		return (
			<section style={{ display: 'grid', gap: 12 }}>
				<h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
					NBA Weekly Schedule
				</h1>
				<div className='card' style={{ color: '#dc2626' }}>
					Failed to load data: {err}
				</div>
			</section>
		);
	}

	return (
		<section style={{ display: 'grid', gap: 12 }}>
			<header className='toolbar'>
				<h1>NBA Weekly Schedule</h1>
				<div className='controls'>
					<label className='sr-only' htmlFor='sort'>
						Sort
					</label>
					<select
						id='sort'
						className='input'
						onChange={(e) => setSortBy(e.target.value)}
						value={sortBy}
					>
						<option value='team'>Team (A–Z)</option>
						<option value='totalDesc'>Total W1–W23 (High→Low)</option>
						<option value='totalAsc'>Total W1–W23 (Low→High)</option>
					</select>
				</div>
			</header>

			<div className='table-wrap'>
				<table className='grid'>
					<thead>
						<tr>
							<th className='sticky-col team-head'>Team</th>
							{headers.map((h, i) => (
								<th key={h} className={`week ${i === 0 ? 'after-team' : ''}`}>
									{h}
								</th>
							))}
							<th className='right total-head'>Total</th>
						</tr>
					</thead>
					<tbody>
						{sorted.map((r) => (
							<tr key={r.team_abv}>
								<th className='sticky-col team-cell'>
									<div className='team-line'>
										<span className='team-name'>{r.team}</span>
										<span className='team-abv'>{r.team_abv}</span>
									</div>
								</th>
								{Array.from({ length: WEEKS }, (_, i) => {
									const val = r.weekly_games?.[i] ?? 0;
									const tone =
										val === 5
											? 'g5'
											: val === 4
											? 'g4'
											: val === 2
											? 'g2'
											: 'g0';
									return (
										<td
											key={i}
											className={`num ${tone} ${i === 0 ? 'after-team' : ''}`}
										>
											{val}
										</td>
									);
								})}
								<td className='num strong right total-cell'>{r.total_23}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<style>{`
        .sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .card{ border:1px solid var(--border); border-radius:12px; background:var(--card); padding:10px 12px; box-shadow: var(--shadow); }

        .toolbar{
          display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        }
        .toolbar h1{ margin:0; font-size:20px; font-weight:800; }
        .controls{ display:flex; gap:8px; align-items:center; }
        .input{ padding:6px 8px; border:1px solid var(--border); border-radius:8px; background: var(--bg); color: var(--fg); font-size:12px; }

        .tip{ font-size:11px; color:var(--muted); background: rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); padding:6px 8px; border-radius:8px; }

        /* Table wrapper: keep scroll, but try to fit within viewport */
        .table-wrap{
          overflow:auto;
          border:1px solid var(--border);
          border-radius:12px;
          background: var(--card);
          box-shadow: var(--shadow);
        }

        table.grid{
          width:max-content;
          min-width:100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
          font-size:12.5px;  /* compact font */
          line-height: 1.2;
        }

        thead th{
          position: sticky;
          top: 0;
          background: var(--card);
          z-index: 2;
          padding: 6px 8px;        /* compact header padding */
          border-bottom: 1px solid var(--border);
          text-align: center;
          font-weight: 800;
          color: var(--muted);
          white-space: nowrap;
        }
        thead .team-head{ text-align:left; }
        thead .week{ width: 42px; }   /* narrow fixed week cols */
        .total-head{ width: 58px; }

        tbody th, tbody td{
          padding: 14px 8px;          /* compact cell padding */
          border-bottom: 1px solid var(--border);
          background: var(--card);
          vertical-align: middle;
          border-left: 1px solid color-mix(in oklab, var(--border) 70%, transparent); /* thin vertical lines */
        }

        /* First column: sticky and not too wide */
        .sticky-col{
          position: sticky;
          left: 0;
          z-index: 1;
          background: var(--card);
          border-right: none;
        }
        .team-head, .team-cell{ min-width: 170px; }  /* keep tight */
        @media (max-width: 1100px){
          .team-head, .team-cell{ min-width: 150px; }
        }

        /* Strong vertical divider right after Team column + minimal gap */
        .after-team{
          border-left: 2px solid var(--border);
        }

        /* Numbers centered to save width */
        .num{ text-align: center; font-variant-numeric: tabular-nums; }
        .strong{ font-weight: 800; }
        .right{ text-align: right; }

        /* Team line: name + abv in one line to save space (wrap if needed) */
        .team-line{ display:flex; gap:6px; align-items:baseline; flex-wrap:wrap; }
        .team-name{ font-weight:700; }
        .team-abv{ font-size:11px; color: var(--muted); }

        /* Color coding for cells */
        /* 5 games: dark green; 4 games: light green; 3 games: transparent; 2 games: light red */
        .g5{ background: color-mix(in oklab, #10b981 100%, transparent); }
        .g4{ background: color-mix(in oklab, #10b981 48%, transparent); }
        .g2{ background: color-mix(in oklab, #ef4444 48%, transparent); }
        .g0{ background: transparent; }

        /* Total column hidden on small screens to help fit without scroll */
        .total-head, .total-cell{ display: none; }
        @media (min-width: 1200px){
          .total-head, .total-cell{ display: table-cell; }
        }
      `}</style>
		</section>
	);
}
