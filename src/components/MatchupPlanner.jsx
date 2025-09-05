'use client';
import React from 'react';

const CATS = ['PTS', 'REB', 'AST', 'STL', 'BLK', 'FG%', 'FT%', '3PM', 'TO'];

export default function MatchupPlanner() {
	const week = getWeekRange();
	const my = mockTeam('My Team');
	const opp = mockTeam('Rival Team');

	const schedule = buildSchedule(my, opp, week.start, week.end);
	const catTotals = computeCatTotals(my, opp);
	const recs = streamingRecs(schedule);

	const myGames = schedule.reduce((a, d) => a + d.mine.length, 0);
	const oppGames = schedule.reduce((a, d) => a + d.opp.length, 0);

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
					Matchup Planner
				</h1>
				<div style={{ display: 'flex', gap: 10 }}>
					<button className='btn ghost'>Export</button>
					<button className='btn primary'>Simulate</button>
				</div>
			</header>

			{/* Controls */}
			<div className='card' style={{ display: 'grid', gap: 12 }}>
				<div
					style={{
						display: 'grid',
						gap: 12,
						gridTemplateColumns: 'repeat(12,1fr)'
					}}
				>
					<Field label='My Team' col={3}>
						<select className='select'>
							<option>My Team (League A)</option>
						</select>
					</Field>
					<Field label='Opponent' col={3}>
						<select className='select'>
							<option>Rival Team</option>
							<option>Hoopers United</option>
						</select>
					</Field>
					<Field label='Week Start' col={3}>
						<input className='input' type='date' defaultValue={week.start} />
					</Field>
					<Field label='Week End' col={3}>
						<input className='input' type='date' defaultValue={week.end} />
					</Field>
				</div>
				<div className='tip'>
					Tip: Use streaming on days where your team has fewer games than your
					opponent.
				</div>
			</div>

			{/* KPI cards */}
			<div
				style={{
					display: 'grid',
					gap: 12,
					gridTemplateColumns: 'repeat(12,1fr)'
				}}
			>
				<Stat title='Your Games' value={myGames} col={3} />
				<Stat title='Opponent Games' value={oppGames} col={3} />
				<Stat title='Schedule Edge' value={myGames - oppGames} col={3} />
				<Stat title='Favored Cats' value={catTotals.favored} col={3} />
			</div>

			{/* Category matchup bars */}
			<div className='card'>
				<h3 className='card-title'>Category Outlook</h3>
				<div className='cat-grid'>
					{CATS.map((cat) => {
						const v = catTotals.rows[cat]; // -100 .. +100 (edge towards you)
						return (
							<div key={cat} className='cat-row'>
								<div className='cat-label'>{cat}</div>
								<div className='cat-bar'>
									<div className='cat-midline' />
									<div
										className={`cat-fill ${v >= 0 ? 'pos' : 'neg'}`}
										style={{ width: `${Math.min(100, Math.abs(v))}%` }}
									/>
								</div>
								<div className={`cat-val ${v >= 0 ? 'pos' : 'neg'}`}>
									{v > 0 ? '+' : ''}
									{Math.round(v)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Schedule compare */}
			<div className='card'>
				<h3 className='card-title'>Schedule Comparison</h3>
				<table className='table'>
					<thead>
						<tr>
							<th>Day</th>
							<th>My Games</th>
							<th>Opponent Games</th>
							<th>Edge</th>
						</tr>
					</thead>
					<tbody>
						{schedule.map((d) => (
							<tr key={d.date}>
								<td>
									<strong>{fmtDay(d.date)}</strong>
									<div className='muted'>{d.date}</div>
								</td>
								<td>{d.mine.length}</td>
								<td>{d.opp.length}</td>
								<td
									className={d.mine.length - d.opp.length >= 0 ? 'pos' : 'neg'}
								>
									{d.mine.length - d.opp.length >= 0 ? 'You +' : 'Them '}{' '}
									{Math.abs(d.mine.length - d.opp.length)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Streaming recommendations */}
			<div className='card'>
				<h3 className='card-title'>Streaming Suggestions</h3>
				{recs.length === 0 ? (
					<div className='muted'>
						No clear streaming edges this week. Consider category targeting
						instead.
					</div>
				) : (
					<ul className='list'>
						{recs.map((r, i) => (
							<li key={i} className='list-row'>
								<span className='dot' />
								<div>
									<div>
										<strong>{fmtDay(r.date)}</strong> — add a streamer ({r.need}{' '}
										need)
									</div>
									<div className='muted'>
										Edge: You {r.edge > 0 ? '+' : ''}
										{r.edge} games • Targets: {r.hint}
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Daily details */}
			<div style={{ display: 'grid', gap: 12 }}>
				{schedule.map((d) => (
					<details key={d.date} className='card' open>
						<summary className='day-head'>
							<div>
								<div className='day-title'>{fmtDay(d.date)}</div>
								<div className='muted'>{d.date}</div>
							</div>
							<div className='badges'>
								<span className='pill-count'>{d.mine.length} you</span>
								<span className='pill-count alt'>{d.opp.length} opp</span>
							</div>
						</summary>
						<div className='grid2'>
							<div>
								<h4 className='subhead'>Your Players</h4>
								<ul className='list'>
									{d.mine.map((p, i) => (
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
								<h4 className='subhead'>Opponent</h4>
								<ul className='list'>
									{d.opp.map((p, i) => (
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
        .input{ width:91%; padding:10px 12px; border:1px solid var(--border); border-radius:10px; background:var(--bg); color:var(--fg); }
        .select{ width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:10px; background:var(--bg); color:var(--fg); }
        .tip{ font-size:12px; color:var(--muted); background: rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); padding:8px 10px; border-radius:10px; }

        .table{ width:100%; border-collapse: collapse; font-size:14px; }
        .table th, .table td{ text-align:left; padding:10px 8px; border-top:1px solid var(--border); }
        .table thead th{ font-size:12px; color:var(--muted); border-top:none; }
        .pos{ color:#16a34a; } .neg{ color:#dc2626; }

        .cat-grid{ display:grid; gap:8px; }
        .cat-row{ display:grid; grid-template-columns: 72px 1fr 52px; align-items:center; gap:10px; }
        .cat-label{ font-size:12px; color:var(--muted); font-weight:700; }
        .cat-bar{ position:relative; height:10px; background:rgba(2,6,23,0.06); border-radius:999px; overflow:hidden; }
        .cat-midline{ position:absolute; left:50%; top:0; bottom:0; width:2px; background:rgba(2,6,23,0.08); transform: translateX(-1px); }
        .cat-fill{ position:absolute; top:0; bottom:0; }
        .cat-fill.pos{ left:50%; background:linear-gradient(90deg,#10b981,#22c55e); }
        .cat-fill.neg{ right:50%; background:linear-gradient(270deg,#f97316,#ef4444); }
        .cat-val{ font-weight:800; text-align:right; }

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

/* UI bits */
function Field({ label, col = 3, children }) {
	return (
		<div style={{ gridColumn: `span ${col}` }}>
			<label className='label'>{label}</label>
			{children}
		</div>
	);
}
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

/* helpers + mock data */
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

function mockPlayer(name, pos, team) {
	// random-ish category strengths for demo
	const r = () => Math.random();
	return {
		name,
		pos,
		team,
		cats: {
			PTS: r(),
			REB: r(),
			AST: r(),
			STL: r(),
			BLK: r(),
			'FG%': r(),
			'FT%': r(),
			'3PM': r(),
			TO: r()
		}
	};
}
function mockTeam(label) {
	const pool = [
		mockPlayer('T. Haliburton', 'PG', 'IND'),
		mockPlayer('J. Brunson', 'PG', 'NYK'),
		mockPlayer('M. Bridges', 'SF', 'BKN'),
		mockPlayer('D. Sabonis', 'C', 'SAC'),
		mockPlayer('J. Smith', 'PF', 'HOU'),
		mockPlayer('A. Caruso', 'SG', 'OKC'),
		mockPlayer('K. Johnson', 'SF', 'SAS'),
		mockPlayer('W. Carter', 'C', 'ORL'),
		mockPlayer('C. Sexton', 'G', 'UTA'),
		mockPlayer('G. Trent Jr.', 'G', 'TOR')
	];
	return { label, players: pool };
}
function buildSchedule(my, opp, startISO, endISO) {
	const start = new Date(startISO);
	const days = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		const date = toISO(d);
		const myCount = i % 2 === 0 ? 6 : 3;
		const oppCount = i % 3 === 0 ? 5 : 4;
		days.push({
			date,
			mine: my.players.slice(0, myCount),
			opp: opp.players.slice(0, oppCount)
		});
	}
	return days;
}
function computeCatTotals(my, opp) {
	const myAgg = aggCats(my.players);
	const oppAgg = aggCats(opp.players);
	const rows = {};
	let favored = 0;
	for (const c of CATS) {
		const me = myAgg[c] ?? 0;
		const them = oppAgg[c] ?? 0;
		// normalize to -100..100 range for display
		const edge = (me - them) * 100;
		rows[c] = Math.max(-100, Math.min(100, Math.round(edge)));
		if (rows[c] > 0) favored++;
	}
	return { rows, favored };
}
function aggCats(players) {
	const sum = Object.fromEntries(CATS.map((c) => [c, 0]));
	for (const p of players) {
		for (const c of CATS) {
			sum[c] += p.cats[c] || 0;
		}
	}
	return sum;
}
function streamingRecs(schedule) {
	// Suggest streaming on days you trail in raw games
	const recs = [];
	for (const d of schedule) {
		const edge = d.mine.length - d.opp.length;
		if (edge < 0) {
			recs.push({
				date: d.date,
				edge: Math.abs(edge),
				need: edge < 0 ? 'volume' : 'none',
				hint: edge < 0 ? 'PG/SG with back-to-back, 3PM/AST focus' : '—'
			});
		}
	}
	return recs.slice(0, 3);
}
