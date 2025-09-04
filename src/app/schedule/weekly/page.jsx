'use client';
import { useEffect, useMemo, useState } from 'react';

export default function WeeklyAdvancedSchedulePage() {
	const [rows, setRows] = useState([]);
	const [error, setError] = useState(null);
	const [selectedWeekKey, setSelectedWeekKey] = useState('week_1'); // "week_1".."week_23"

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/data/nba_2025_weekly_games.json', {
					cache: 'no-store'
				});
				if (!res.ok) throw new Error('Failed to load weekly data JSON');
				const data = await res.json();
				setRows(Array.isArray(data) ? data : []);
			} catch (e) {
				setError(e.message || String(e));
			}
		})();
	}, []);

	const totalWeeks = useMemo(() => {
		if (rows.length > 0) {
			const keys = Object.keys(rows[0]).filter((k) => /^week_\d+$/.test(k));
			const nums = keys.map((k) => Number(k.split('_')[1])).filter(Boolean);
			const max = nums.length ? Math.max(...nums) : 23;
			return Math.min(max, 23);
		}
		return 23;
	}, [rows]);

	const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	const sorted = useMemo(() => {
		return [...rows].sort((a, b) => (a.team || '').localeCompare(b.team || ''));
	}, [rows]);

	if (error) {
		return (
			<section className='wrap'>
				<h1 className='title'>Weekly Advanced Schedule</h1>
				<div className='error'>Error: {error}</div>
				<style>{baseStyles}</style>
			</section>
		);
	}

	return (
		<section className='wrap'>
			<header className='toolbar'>
				<h1 className='title'>Weekly Advanced Schedule</h1>
				<div className='weeks'>
					{Array.from({ length: totalWeeks }, (_, i) => {
						const key = `week_${i + 1}`;
						const active = key === selectedWeekKey;
						return (
							<button
								key={key}
								className={active ? 'wk active' : 'wk'}
								onClick={() => setSelectedWeekKey(key)}
								aria-pressed={active ? 'true' : 'false'}
							>
								W{i + 1}
							</button>
						);
					})}
				</div>
			</header>
			<div className='hint'>
				Click a week above to switch. Cells show the opponent’s abbreviation
				(e.g., <code>DEN</code>) for home games and <code>@DEN</code> for away
				games. Empty cell = no game. Total counts the number of games that week.
			</div>

			<div className='table-wrap'>
				<table className='grid'>
					{/* Explicit widths to enforce layout */}
					<colgroup>
						<col className='col-team' />
						<col className='col-day' />
						<col className='col-day' />
						<col className='col-day' />
						<col className='col-day' />
						<col className='col-day' />
						<col className='col-day' />
						<col className='col-day' />
						<col className='col-total' />
					</colgroup>

					<thead>
						<tr>
							<th className='sticky team-col'>Team</th>
							{dayLabels.map((d, i) => (
								<th key={d} className={`day ${i === 0 ? 'after-team' : ''}`}>
									{d}
								</th>
							))}
							<th className='total-col'>Total</th>
						</tr>
					</thead>

					<tbody>
						{sorted.map((t) => {
							const daily = (t?.[selectedWeekKey] || Array(7).fill(0)).slice(
								0,
								7
							);
							const total = daily.reduce(
								(acc, v) => acc + (v && v !== 0 ? 1 : 0),
								0
							);
							return (
								<tr key={t.team}>
									<th className='sticky team-col'>
										<div className='team-line'>
											<span className='team-name'>{t.team}</span>
										</div>
									</th>
									{daily.map((v, i) => {
										const val = v === 0 ? '' : String(v);
										const away = val.startsWith('@');
										return (
											<td
												key={i}
												className={`cell ${i === 0 ? 'after-team' : ''} ${
													away ? 'away' : ''
												}`}
												title={val}
											>
												{val}
											</td>
										);
									})}
									<td className='cell total-col strong'>{total}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<style>{baseStyles}</style>
			<style>{styles}</style>
		</section>
	);
}

/* Shared base styles */
const baseStyles = `
:root{
  --bg:#ffffff; --card:#ffffff; --fg:#0f172a; --muted:#6b7280; --border:#e5e7eb;
  --shadow:0 8px 24px rgba(2,6,23,.08); --accent:linear-gradient(135deg,#7c3aed,#2563eb);
}
[data-theme="dark"]{
  --bg:#0b1020; --card:#0f1528; --fg:#e5e7eb; --muted:#9ca3af; --border:#1f2a44;
  --shadow:0 8px 24px rgba(0,0,0,.5); --accent:linear-gradient(135deg,#a78bfa,#60a5fa);
}
.wrap{ display:grid; gap:12px; }
.title{ margin:0; font-size:22px; font-weight:800; }
.error{ border:1px solid var(--border); padding:10px 12px; border-radius:10px; color:#dc2626; background:var(--card); }
`;

/* Page-specific styles (explicit widths via <colgroup>) */
const styles = `
.toolbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.weeks{ display:flex; gap:6px; flex-wrap:wrap; }
.wk{
  font-size:12px; padding:6px 10px; border-radius:999px; border:1px solid var(--border);
  background:var(--card); color:var(--fg); cursor:pointer; transition:.2s;
}
.wk:hover{ box-shadow: var(--shadow); transform: translateY(-1px); }
.wk.active{
  background: var(--accent); color:#fff; border-color: transparent;
  box-shadow: 0 6px 18px rgba(37,99,235,.25);
}

.hint{
  font-size:12px; color:var(--muted);
  background: color-mix(in oklab, #10b981 10%, transparent);
  border:1px solid color-mix(in oklab, #10b981 30%, transparent);
  padding:8px 10px; border-radius:10px;
}

.table-wrap{
  overflow:auto;
  border:1px solid var(--border);
  border-radius:12px;
  background: var(--card);
  box-shadow: var(--shadow);
}

/* Fixed layout + explicit widths */
table.grid{
  width:100%;
  border-collapse: separate;
  border-spacing:0;
  table-layout: fixed;
  font-size:13px;
}

col.col-team  { width: 240px; }  
col.col-day   { width: 46px; }   
col.col-total { width: 64px; }

@media (max-width: 1280px){
  col.col-team  { width: 220px; }
  col.col-day   { width: 44px; }
}
@media (max-width: 1024px){
  col.col-team  { width: 210px; }
  col.col-day   { width: 42px; }
}


thead th{
  position: sticky; top:0; z-index:2; background:var(--card);
  padding:8px; border-bottom:1px solid var(--border); color:var(--muted);
  text-align:center; font-weight:800; white-space:nowrap;
}

/* Roomier rows */
tbody td, tbody th{
  padding:12px 8px;  /* more vertical, tight horizontal */
  border-bottom:1px solid var(--border);
  background: var(--card);
}

/* Center the first column content + keep single line with ellipsis */
.team-col{
  text-align: center;              /* center text */
  white-space: nowrap;             /* no wrap */
  overflow: hidden;
  text-overflow: ellipsis;         /* clean truncation if needed */
}

.sticky{ position:sticky; left:0; z-index:1; background:var(--card); }

/* Vertical separators */
tbody td, thead th { border-left: 1px solid color-mix(in oklab, var(--border) 70%, transparent); }
tbody td:first-child, thead th:first-child { border-left: none; }

/* Strong divider after Team */
.after-team{ border-left: 2px solid var(--border) !important; }

.cell{ text-align:center; font-variant-numeric: tabular-nums; }
.strong{ font-weight:800; }

/* Make the inner line centered too */
.team-line{
  display: inline-flex;            /* inline so centering looks natural */
  gap: 6px;
  align-items: center;
  justify-content: center;         /* center text inside the cell */
}

.team-name{ font-weight:700; }
.away{ font-style: italic; }
`;
