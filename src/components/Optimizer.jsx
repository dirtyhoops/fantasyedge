'use client';
import React from 'react';

export default function Optimizer() {
	const week = getWeekRange();
	const plan = mockPlan(week.start, week.end);
	const startersTotal = plan.reduce((a, d) => a + d.starters.length, 0);
	const benchTotal = plan.reduce((a, d) => a + d.bench.length, 0);

	return (
		<section style={{ display: 'grid', gap: 20 }}>
			<header
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 12,
					flexWrap: 'wrap'
				}}
			>
				<h1
					style={{
						fontSize: 24,
						fontWeight: 800,
						letterSpacing: -0.3,
						margin: 0
					}}
				>
					Weekly Optimizer
				</h1>
				<div style={{ display: 'flex', gap: 10 }}>
					<button className='btn ghost'>Export Plan</button>
					<button className='btn primary'>Optimize Lineup</button>
				</div>
			</header>

			{/* Controls */}
			<div className='card' style={{ display: 'grid', gap: 12 }}>
				<div
					style={{
						display: 'grid',
						gap: 12,
						gridTemplateColumns: 'repeat(12, 1fr)'
					}}
				>
					<div className='field' style={{ gridColumn: 'span 4' }}>
						<label className='label'>Team</label>
						<select className='input'>
							<option>My Team (League A)</option>
							<option>Friends League</option>
						</select>
					</div>
					<div className='field' style={{ gridColumn: 'span 3' }}>
						<label className='label'>Week Start</label>
						<input className='input' type='date' defaultValue={week.start} />
					</div>
					<div className='field' style={{ gridColumn: 'span 3' }}>
						<label className='label'>Week End</label>
						<input className='input' type='date' defaultValue={week.end} />
					</div>
					<div className='field' style={{ gridColumn: 'span 2' }}>
						<label className='label'>Format</label>
						<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
							<span className='chip chip-on'>9-cat</span>
							<span className='chip'>8-cat</span>
							<span className='chip'>Points</span>
						</div>
					</div>
				</div>
				<div className='tip'>
					Tip: For the MVP, we start every player on the days they play and
					bench on off-days. Position limits coming next.
				</div>
			</div>

			{/* KPI Cards */}
			<div
				style={{
					display: 'grid',
					gap: 12,
					gridTemplateColumns: 'repeat(12, 1fr)'
				}}
			>
				<Stat title='Games This Week' value={startersTotal} col={3} />
				<Stat title='Bench Games' value={benchTotal} col={3} />
				<Stat
					title='Projected Value'
					value={Math.round(startersTotal * 12)}
					suffix=' pts'
					col={3}
				/>
				<Stat
					title='Utilization'
					value={`${Math.round(
						(startersTotal / (startersTotal + benchTotal || 1)) * 100
					)}%`}
					col={3}
				/>
			</div>

			{/* Schedule Summary */}
			<div className='card'>
				<h3 className='card-title'>Schedule Summary</h3>
				<table className='table'>
					<thead>
						<tr>
							<th>Day</th>
							<th>Starters</th>
							<th>Bench</th>
							<th>Notes</th>
						</tr>
					</thead>
					<tbody>
						{plan.map((d) => (
							<tr key={d.date}>
								<td>
									<strong>{fmtDay(d.date)}</strong>
									<div className='muted'>{d.date}</div>
								</td>
								<td>{d.starters.length}</td>
								<td>{d.bench.length}</td>
								<td className='muted'>
									{d.starters.length > 8
										? 'Heavy slate'
										: d.starters.length <= 3
										? 'Light slate'
										: 'Normal'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Daily Plan */}
			<div style={{ display: 'grid', gap: 12 }}>
				{plan.map((d) => (
					<details key={d.date} className='card' open>
						<summary className='day-head'>
							<div>
								<div className='day-title'>{fmtDay(d.date)}</div>
								<div className='muted'>{d.date}</div>
							</div>
							<div className='badges'>
								<span className='pill-count'>{d.starters.length} starters</span>
								<span className='pill-count alt'>{d.bench.length} bench</span>
							</div>
						</summary>
						<div className='grid2'>
							<div>
								<h4 className='subhead'>Start</h4>
								<ul className='list'>
									{d.starters.map((p, i) => (
										<li key={i} className='list-row'>
											<span className='dot' /> {p.name}{' '}
											<span className='muted'>
												({p.pos} – {p.team})
											</span>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h4 className='subhead'>Bench</h4>
								<ul className='list'>
									{d.bench.map((p, i) => (
										<li key={i} className='list-row'>
											<span className='dot off' /> {p.name}{' '}
											<span className='muted'>
												({p.pos} – {p.team})
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</details>
				))}
			</div>

			<style>{`
        .card{ border:1px solid var(--border); border-radius:16px; background:var(--card); padding:16px 16px; box-shadow: var(--shadow); }
        .card-title{ margin:0 0 10px 0; font-size:16px; font-weight:800; }
        .label{ font-size:12px; color:var(--muted); margin-bottom:6px; display:block; }
        .input, .select{ width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:10px; background:var(--bg); color:var(--fg); }
        .chip{ display:inline-flex; align-items:center; padding:8px 12px; border-radius:999px; border:1px solid var(--border); font-size:12px; color:var(--fg); background:var(--card); }
        .chip-on{ border-color: transparent; background: var(--accent); color:#fff; }
        .tip{ font-size:12px; color:var(--muted); background: rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); padding:8px 10px; border-radius:10px; }

        .table{ width:100%; border-collapse: collapse; font-size:14px; }
        .table th, .table td{ text-align:left; padding:10px 8px; border-top:1px solid var(--border); }
        .table thead th{ font-size:12px; color:var(--muted); border-top:none; }

        .day-head{ display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
        .day-title{ font-size:16px; font-weight:800; }
        .badges{ display:flex; gap:8px; }
        .pill-count{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background: rgba(37,99,235,0.1); color:#2563eb; font-weight:700; font-size:12px; }
        .pill-count.alt{ background: rgba(2,6,23,0.06); color: var(--fg); }

        .grid2{ display:grid; grid-template-columns:1fr; gap:12px; margin-top:12px; }
        @media(min-width:900px){ .grid2{ grid-template-columns:1fr 1fr; } }

        .subhead{ margin:6px 0 6px; font-size:13px; color:var(--muted); font-weight:800; text-transform: uppercase; letter-spacing: .08em; }
        .list{ list-style:none; padding:0; margin:0; display:grid; gap:6px; }
        .list-row{ display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--border); border-radius:12px; }
        .dot{ width:8px; height:8px; border-radius:999px; background:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,.15); }
        .dot.off{ background:#9ca3af; box-shadow:0 0 0 3px rgba(156,163,175,.15); }

        .muted{ color:var(--muted); font-size:12px; }
      `}</style>
		</section>
	);
}

/* helpers */
function Stat({ title, value, suffix = '', col = 3 }) {
	return (
		<div className='card' style={{ gridColumn: `span ${col}` }}>
			<div className='muted' style={{ marginBottom: 6 }}>
				{title}
			</div>
			<div style={{ fontSize: 24, fontWeight: 800 }}>
				{value}
				{suffix}
			</div>
		</div>
	);
}

function getWeekRange() {
	const now = new Date();
	const day = now.getDay();
	const diffToMon = (day === 0 ? -6 : 1) - day;
	const start = new Date(now);
	start.setDate(now.getDate() + diffToMon);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	return { start: toISO(start), end: toISO(end) };
}

function toISO(d) {
	return d.toISOString().slice(0, 10);
}

function fmtDay(iso) {
	return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
		weekday: 'long'
	});
}

function mockPlan(startISO) {
	const start = new Date(startISO);
	const days = [];
	const pool = [
		{ name: 'J. Brunson', pos: 'PG', team: 'NYK' },
		{ name: 'A. Caruso', pos: 'SG', team: 'OKC' },
		{ name: 'K. Johnson', pos: 'SF', team: 'SAS' },
		{ name: 'J. Smith', pos: 'PF', team: 'HOU' },
		{ name: 'D. Sabonis', pos: 'C', team: 'SAC' },
		{ name: 'T. Haliburton', pos: 'PG', team: 'IND' },
		{ name: 'M. Bridges', pos: 'SF', team: 'BKN' },
		{ name: 'W. Carter', pos: 'C', team: 'ORL' },
		{ name: 'C. Sexton', pos: 'G', team: 'UTA' },
		{ name: 'G. Trent Jr.', pos: 'G', team: 'TOR' }
	];
	for (let i = 0; i < 7; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		const date = toISO(d);
		const playsToday = i % 2 === 0 ? 6 : 3;
		const starters = pool.slice(0, playsToday);
		const bench = pool.slice(playsToday, 10);
		days.push({ date, starters, bench });
	}
	return days;
}
