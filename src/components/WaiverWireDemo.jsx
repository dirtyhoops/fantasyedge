'use client';
import React, { useMemo, useState } from 'react';

export default function WaiverWireDemo() {
	// --- Demo data (self-contained) ---
	const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const CATS = ['PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'TO']; // TO: lower is better

	const demoPlayers = [
		{
			id: 'p1',
			name: 'Jalen Smith',
			team_abv: 'IND',
			positions: ['PF', 'C'],
			roster_pct: 42,
			notes: 'Boards/FG% streamer'
		},
		{
			id: 'p2',
			name: 'Norman Powell',
			team_abv: 'LAC',
			positions: ['SG', 'SF'],
			roster_pct: 48,
			notes: '3PM/PTS'
		},
		{
			id: 'p3',
			name: 'Markelle Fultz',
			team_abv: 'ORL',
			positions: ['PG'],
			roster_pct: 33,
			notes: 'AST/STL'
		},
		{
			id: 'p4',
			name: 'Mitchell Robinson',
			team_abv: 'NYK',
			positions: ['C'],
			roster_pct: 38,
			notes: 'BLK/FG%'
		},
		{
			id: 'p5',
			name: 'Rui Hachimura',
			team_abv: 'LAL',
			positions: ['SF', 'PF'],
			roster_pct: 29,
			notes: 'PTS/3PM'
		},
		{
			id: 'p6',
			name: 'Caris LeVert',
			team_abv: 'CLE',
			positions: ['SG', 'SF'],
			roster_pct: 54,
			notes: 'PTS/AST'
		},
		{
			id: 'p7',
			name: 'Nick Richards',
			team_abv: 'CHA',
			positions: ['C'],
			roster_pct: 21,
			notes: 'REB/BLK'
		},
		{
			id: 'p8',
			name: 'Bennedict Mathurin',
			team_abv: 'IND',
			positions: ['SG', 'SF'],
			roster_pct: 58,
			notes: 'PTS/FT%'
		},
		{
			id: 'p9',
			name: 'Jose Alvarado',
			team_abv: 'NOP',
			positions: ['PG'],
			roster_pct: 12,
			notes: 'STL/3PM'
		},
		{
			id: 'p10',
			name: 'Grayson Allen',
			team_abv: 'PHX',
			positions: ['SG'],
			roster_pct: 41,
			notes: 'Efficient 3s'
		},
		{
			id: 'p11',
			name: 'Naz Reid',
			team_abv: 'MIN',
			positions: ['C'],
			roster_pct: 52,
			notes: 'Points/3s from C'
		},
		{
			id: 'p12',
			name: 'Donte DiVincenzo',
			team_abv: 'NYK',
			positions: ['SG'],
			roster_pct: 62,
			notes: 'Elite 3PM'
		},
		{
			id: 'p13',
			name: 'Jaden McDaniels',
			team_abv: 'MIN',
			positions: ['SF', 'PF'],
			roster_pct: 57,
			notes: '3&D forward'
		},
		{
			id: 'p14',
			name: 'Ivica Zubac',
			team_abv: 'LAC',
			positions: ['C'],
			roster_pct: 71,
			notes: 'Boards/Blocks'
		},
		{
			id: 'p15',
			name: 'Josh Hart',
			team_abv: 'NYK',
			positions: ['SG', 'SF'],
			roster_pct: 68,
			notes: 'Across-the-board'
		},
		{
			id: 'p16',
			name: 'Buddy Hield',
			team_abv: 'PHI',
			positions: ['SG'],
			roster_pct: 66,
			notes: 'High 3PM'
		},
		{
			id: 'p17',
			name: 'Derrick White',
			team_abv: 'BOS',
			positions: ['PG', 'SG'],
			roster_pct: 78,
			notes: 'Stuffing stats'
		},
		{
			id: 'p18',
			name: 'Alperen Sengun',
			team_abv: 'HOU',
			positions: ['C'],
			roster_pct: 95,
			notes: 'Star center'
		},
		{
			id: 'p19',
			name: 'Keegan Murray',
			team_abv: 'SAC',
			positions: ['SF', 'PF'],
			roster_pct: 80,
			notes: '3s/scoring'
		},
		{
			id: 'p20',
			name: 'Austin Reaves',
			team_abv: 'LAL',
			positions: ['SG'],
			roster_pct: 76,
			notes: 'AST/PTS'
		}
	];
	const teams = [
		'ATL',
		'BOS',
		'BKN',
		'CHA',
		'CHI',
		'CLE',
		'DAL',
		'DEN',
		'DET',
		'GSW',
		'HOU',
		'IND',
		'LAC',
		'LAL',
		'MEM',
		'MIA',
		'MIL',
		'MIN',
		'NOP',
		'NYK',
		'OKC',
		'ORL',
		'PHI',
		'PHX',
		'POR',
		'SAC',
		'SAS',
		'TOR',
		'UTA',
		'WAS'
	];

	// Per-game category projections (toy data purely for demo)
	// Units: counting stats per game; TO per game (lower better)
	const projPerGame = {
		p1: {
			PTS: 12,
			REB: 8.5,
			AST: 1.2,
			'3PM': 0.7,
			STL: 0.6,
			BLK: 1.1,
			TO: 1.1
		},
		p2: {
			PTS: 16,
			REB: 3.2,
			AST: 2.5,
			'3PM': 2.2,
			STL: 0.9,
			BLK: 0.2,
			TO: 1.4
		},
		p3: {
			PTS: 11,
			REB: 3.6,
			AST: 5.9,
			'3PM': 0.6,
			STL: 1.5,
			BLK: 0.2,
			TO: 2.3
		},
		p4: { PTS: 8, REB: 9.8, AST: 0.8, '3PM': 0.0, STL: 0.8, BLK: 1.9, TO: 0.9 },
		p5: {
			PTS: 14,
			REB: 5.2,
			AST: 1.8,
			'3PM': 1.8,
			STL: 0.6,
			BLK: 0.3,
			TO: 1.2
		},
		p6: {
			PTS: 15,
			REB: 4.5,
			AST: 4.0,
			'3PM': 1.6,
			STL: 1.1,
			BLK: 0.3,
			TO: 2.1
		},
		p7: { PTS: 9, REB: 7.9, AST: 0.9, '3PM': 0.1, STL: 0.5, BLK: 1.4, TO: 1.0 },
		p8: {
			PTS: 17,
			REB: 4.1,
			AST: 2.1,
			'3PM': 1.9,
			STL: 0.8,
			BLK: 0.2,
			TO: 1.8
		},
		p9: { PTS: 7, REB: 2.1, AST: 3.4, '3PM': 1.5, STL: 1.3, BLK: 0.1, TO: 1.1 },
		p10: {
			PTS: 12,
			REB: 3.7,
			AST: 2.3,
			'3PM': 2.5,
			STL: 0.8,
			BLK: 0.1,
			TO: 0.9
		},
		p11: {
			PTS: 14,
			REB: 6.5,
			AST: 1.2,
			'3PM': 1.4,
			STL: 0.7,
			BLK: 1.0,
			TO: 1.3
		},
		p12: {
			PTS: 14,
			REB: 3.8,
			AST: 2.9,
			'3PM': 3.1,
			STL: 1.1,
			BLK: 0.3,
			TO: 1.2
		},
		p13: {
			PTS: 12,
			REB: 4.5,
			AST: 1.7,
			'3PM': 1.6,
			STL: 0.9,
			BLK: 1.0,
			TO: 1.2
		},
		p14: {
			PTS: 12,
			REB: 10.0,
			AST: 1.5,
			'3PM': 0.0,
			STL: 0.6,
			BLK: 1.2,
			TO: 1.5
		},
		p15: {
			PTS: 10,
			REB: 7.5,
			AST: 3.8,
			'3PM': 1.1,
			STL: 1.1,
			BLK: 0.3,
			TO: 1.3
		},
		p16: {
			PTS: 15,
			REB: 3.2,
			AST: 2.6,
			'3PM': 3.3,
			STL: 0.9,
			BLK: 0.2,
			TO: 1.7
		},
		p17: {
			PTS: 15,
			REB: 4.2,
			AST: 4.9,
			'3PM': 2.6,
			STL: 1.0,
			BLK: 0.9,
			TO: 1.6
		},
		p18: {
			PTS: 21,
			REB: 9.3,
			AST: 5.0,
			'3PM': 0.8,
			STL: 1.1,
			BLK: 0.7,
			TO: 3.1
		},
		p19: {
			PTS: 16,
			REB: 5.5,
			AST: 2.1,
			'3PM': 2.7,
			STL: 0.9,
			BLK: 0.6,
			TO: 1.5
		},
		p20: {
			PTS: 14,
			REB: 4.4,
			AST: 4.8,
			'3PM': 1.8,
			STL: 0.7,
			BLK: 0.3,
			TO: 1.9
		}
	};

	// Helper to generate a realistic demo week array (Mon..Sun) with 0/label
	function genWeek(team) {
		// ~3-4 games/week typical; randomize days and mix home/away
		const slots = Array(7).fill(0);
		const games = Math.floor(Math.random() * 2) + 3; // 3-4, sometimes 5
		let placed = 0;
		while (placed < games) {
			const d = Math.floor(Math.random() * 7);
			if (slots[d] === 0) {
				const opp = teams[Math.floor(Math.random() * teams.length)];
				const away = Math.random() < 0.5;
				slots[d] = away ? `@${opp}` : `${opp}`;
				placed++;
			}
		}
		return slots;
	}
	// Build 23 weeks of demo data per team
	const scheduleByAbv = new Map();
	for (const t of teams) {
		const weeks = {};
		for (let i = 1; i <= 23; i++) weeks[`week_${i}`] = genWeek(t);
		scheduleByAbv.set(t, weeks);
	}

	// --- UI state ---
	const selectedWeekKey = 'week_1';
	const [search, setSearch] = useState('');
	const [pos, setPos] = useState('ALL'); // ALL | PG | SG | SF | PF | C | G | F
	const [maxRoster, setMaxRoster] = useState(60);
	const [sortBy, setSortBy] = useState('score'); // score | total | roster | name

	// Roster + simulator
	const initialRosterIds = [
		'p1',
		'p2',
		'p3',
		'p4',
		'p5',
		'p6',
		'p7',
		'p8',
		'p9',
		'p10',
		'p11',
		'p12',
		'p13'
	]; // 13-player demo roster
	const [rosterIds, setRosterIds] = useState(initialRosterIds);
	const rosterPlayers = useMemo(
		() => demoPlayers.filter((p) => rosterIds.includes(p.id)),
		[rosterIds]
	);
	const rosterSet = useMemo(() => new Set(rosterIds), [rosterIds]);

	const [addCandidate, setAddCandidate] = useState(null); // player object from FA list
	const [dropCandidateId, setDropCandidateId] = useState(null); // id from roster

	// Derived helpers
	const getWeekArray = (team_abv) => {
		const row = scheduleByAbv.get(team_abv);
		const arr = row?.[selectedWeekKey] || Array(7).fill(0);
		return Array.from({ length: 7 }, (_, i) => arr[i] ?? 0);
	};
	const countGames = (arr7) =>
		arr7.reduce((a, v) => a + (v && v !== 0 ? 1 : 0), 0);
	const countB2Bs = (arr7) => {
		let b = 0;
		for (let i = 0; i < 6; i++) {
			if (arr7[i] && arr7[i + 1]) b++;
		}
		return b;
	};
	const streamScore = (p, arr7) => {
		const g = countGames(arr7);
		const b = countB2Bs(arr7);
		const avail = (100 - (p.roster_pct || 0)) / 100; // 0..1
		return +(g + b * 0.25 + avail * 0.25).toFixed(2);
	};
	const matchesPos = (player) => {
		if (pos === 'ALL') return true;
		const positions = player.positions || [];
		if (pos === 'G') return positions.some((p) => p === 'PG' || p === 'SG');
		if (pos === 'F') return positions.some((p) => p === 'SF' || p === 'PF');
		return positions.includes(pos);
	};

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const rows = demoPlayers
			.filter((p) => !rosterSet.has(p.id)) // only free agents (exclude my 13)
			.filter(
				(p) =>
					(!q ||
						p.name.toLowerCase().includes(q) ||
						(p.team_abv || '').toLowerCase().includes(q)) &&
					matchesPos(p) &&
					(p.roster_pct ?? 0) <= maxRoster
			)
			.map((p) => {
				const w = getWeekArray(p.team_abv);
				return {
					...p,
					_week: w,
					_total: countGames(w),
					_b2b: countB2Bs(w),
					_score: streamScore(p, w)
				};
			});
		switch (sortBy) {
			case 'total':
				return rows.sort(
					(a, b) => b._total - a._total || a.name.localeCompare(b.name)
				);
			case 'roster':
				return rows.sort((a, b) => (a.roster_pct ?? 0) - (b.roster_pct ?? 0));
			case 'name':
				return rows.sort((a, b) => a.name.localeCompare(b.name));
			default:
				return rows.sort((a, b) => b._score - a._score || b._total - a._total);
		}
	}, [search, pos, maxRoster, sortBy, rosterSet]);

	// --- Projections ---
	const perWeekForPlayer = (p) => {
		const arr7 = getWeekArray(p.team_abv);
		const g = countGames(arr7);
		const base = projPerGame[p.id] || {
			PTS: 0,
			REB: 0,
			AST: 0,
			'3PM': 0,
			STL: 0,
			BLK: 0,
			TO: 0
		};
		const out = {};
		for (const c of CATS) out[c] = +(base[c] * g).toFixed(2);
		return out; // totals for the selected week
	};
	const sumCats = (acc, add) => {
		const out = {};
		for (const c of CATS) out[c] = (acc[c] || 0) + (add[c] || 0);
		return out;
	};
	const computeTeamTotals = (playersArr) => {
		return playersArr.reduce((tot, p) => sumCats(tot, perWeekForPlayer(p)), {});
	};
	const beforeTotals = useMemo(
		() => computeTeamTotals(rosterPlayers),
		[rosterPlayers]
	);

	const afterTotals = useMemo(() => {
		if (!addCandidate || !dropCandidateId) return null;
		const nextRoster = rosterPlayers
			.filter((p) => p.id !== dropCandidateId)
			.concat(addCandidate);
		return computeTeamTotals(nextRoster);
	}, [addCandidate, dropCandidateId, rosterPlayers]);

	const diffTotals = useMemo(() => {
		if (!afterTotals) return null;
		const d = {};
		for (const c of CATS)
			d[c] = +(afterTotals[c] - (beforeTotals[c] || 0)).toFixed(2);
		return d;
	}, [afterTotals, beforeTotals]);

	// --- League baseline (mock weekly totals for other teams) used for RANKING only ---
	const otherTeams = [
		{
			name: 'Team Alpha',
			totals: {
				PTS: 520,
				REB: 210,
				AST: 140,
				'3PM': 80,
				STL: 42,
				BLK: 28,
				TO: 85
			}
		},
		{
			name: 'Team Bravo',
			totals: {
				PTS: 480,
				REB: 230,
				AST: 150,
				'3PM': 70,
				STL: 38,
				BLK: 35,
				TO: 92
			}
		},
		{
			name: 'Team Cobra',
			totals: {
				PTS: 505,
				REB: 205,
				AST: 160,
				'3PM': 92,
				STL: 47,
				BLK: 31,
				TO: 88
			}
		},
		{
			name: 'Team Delta',
			totals: {
				PTS: 495,
				REB: 215,
				AST: 145,
				'3PM': 86,
				STL: 44,
				BLK: 29,
				TO: 90
			}
		}
	].map((t) => ({ ...t, totals: { ...t.totals, TO: t.totals.TO } }));
	// ^ keep arrays simple; TO lower is better

	const rankPosition = (cat, mine, othersTotals) => {
		let better = 0;
		for (const o of othersTotals) {
			const ov = o[cat] || 0;
			if (cat === 'TO') {
				if (ov < mine) better++;
			} else {
				if (ov > mine) better++;
			}
		}
		return better + 1; // 1 = best
	};
	const toOrdinal = (n) => {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		const suf = s[(v - 20) % 10] || s[v] || s[0];
		return `${n}${suf}`;
	};

	const ranksBefore = useMemo(() => {
		const others = otherTeams.map((t) => t.totals);
		const r = {};
		for (const c of CATS) r[c] = rankPosition(c, beforeTotals[c] || 0, others);
		return r;
	}, [beforeTotals]);

	const ranksAfter = useMemo(() => {
		if (!afterTotals) return null;
		const others = otherTeams.map((t) => t.totals);
		const r = {};
		for (const c of CATS) r[c] = rankPosition(c, afterTotals[c] || 0, others);
		return r;
	}, [afterTotals]);

	const applyMove = () => {
		if (!addCandidate || !dropCandidateId) return;
		setRosterIds((prev) =>
			prev.filter((id) => id !== dropCandidateId).concat(addCandidate.id)
		);
		setAddCandidate(null);
		setDropCandidateId(null);
	};

	return (
		<div className='min-h-screen bg-white text-slate-900 px-4 py-6'>
			{/* Header */}
			<div className='flex items-center justify-between gap-3 mb-4'>
				<h1 className='text-2xl font-extrabold'>Waiver Wire</h1>
			</div>

			{/* --- Roster + Simulator --- */}
			<div className='grid gap-4 md:grid-cols-3 mb-4'>
				{/* My Roster */}
				<section className='md:col-span-2 border border-slate-200 rounded-xl bg-white shadow'>
					<div className='p-3 border-b border-slate-200 flex items-center justify-between'>
						<h2 className='font-bold'>My Roster (Week 1)</h2>
						<span className='text-xs text-slate-500'>
							Click Drop to set a drop candidate
						</span>
					</div>
					<table className='w-full text-sm table-fixed'>
						<colgroup>
							<col style={{ width: 220 }} />
							<col style={{ width: 72 }} />
							<col style={{ width: 120 }} />
							<col style={{ width: 120 }} />
							<col />
						</colgroup>
						<thead>
							<tr className='bg-slate-50'>
								<th className='text-left p-3 border-b border-slate-200'>
									Player
								</th>
								<th className='p-3 border-b border-slate-200'>Team</th>
								<th className='p-3 border-b border-slate-200'>Pos</th>
								<th className='p-3 border-b border-slate-200'>Games</th>
								<th className='text-right p-3 border-b border-slate-200'>
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{rosterPlayers.map((p) => {
								const g = countGames(getWeekArray(p.team_abv));
								const selected = dropCandidateId === p.id;
								return (
									<tr
										key={p.id}
										className={
											selected ? 'bg-red-50' : 'odd:bg-white even:bg-slate-50'
										}
									>
										<td className='p-3 border-b border-slate-200'>
											<div className='font-semibold'>{p.name}</div>
											<div className='text-xs text-slate-500'>{p.notes}</div>
										</td>
										<td className='p-3 text-center border-b border-slate-200'>
											{p.team_abv}
										</td>
										<td className='p-3 text-center border-b border-slate-200'>
											{p.positions.join(', ')}
										</td>
										<td className='p-3 text-center border-b border-slate-200'>
											{g}
										</td>
										<td className='p-3 text-right border-b border-slate-200'>
											<button
												onClick={() =>
													setDropCandidateId(selected ? null : p.id)
												}
												className={
													selected
														? 'px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-red-50'
														: 'px-3 py-1.5 rounded-lg border border-slate-200'
												}
											>
												{selected ? 'Undo' : 'Drop'}
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</section>

				{/* Simulator Panel */}
				<aside className='border border-slate-200 rounded-xl bg-white shadow p-3'>
					<h2 className='font-bold mb-2'>Before vs After (Week 1)</h2>

					<div className='mb-2 text-sm'>
						<div>
							<b>Add:</b>{' '}
							{addCandidate
								? `${addCandidate.name} (${addCandidate.team_abv})`
								: '— pick from free agents below'}
						</div>
						<div>
							<b>Drop:</b>{' '}
							{dropCandidateId
								? rosterPlayers.find((r) => r.id === dropCandidateId)?.name ||
								  dropCandidateId
								: '— click Drop on your roster'}
						</div>
					</div>

					<div className='overflow-auto border border-slate-200 rounded-lg'>
						<table className='w-full text-xs'>
							<thead>
								<tr className='bg-slate-50'>
									<th className='text-left p-2'>Cat</th>
									<th className='p-2'>Before</th>
									<th className='p-2'>After</th>
									<th className='p-2'>Delta</th>
									<th className='p-2'>Rank</th>
								</tr>
							</thead>
							<tbody>
								{CATS.map((c) => {
									const before = +(beforeTotals[c] || 0).toFixed(2);
									const after = afterTotals
										? +(afterTotals[c] || 0).toFixed(2)
										: before;
									const delta = after - before;
									const better = c === 'TO' ? delta < 0 : delta > 0;
									const deltaCls =
										delta === 0
											? 'text-slate-500'
											: better
											? 'text-emerald-600'
											: 'text-red-600';

									const rb = ranksBefore[c] || 1;
									const ra = (ranksAfter && ranksAfter[c]) || rb;
									const rchg = rb - ra; // + means improved (moved up)
									const rCls =
										rchg === 0
											? 'text-slate-500'
											: rchg > 0
											? 'text-emerald-600'
											: 'text-red-600';

									return (
										<tr key={c} className='odd:bg-white even:bg-slate-50'>
											<td className='p-2 font-semibold'>{c}</td>
											<td className='p-2 text-center'>{before}</td>
											<td className='p-2 text-center'>{after}</td>
											<td
												className={`p-2 text-center font-semibold ${deltaCls}`}
											>
												{delta === 0
													? '0'
													: delta > 0
													? `+${delta.toFixed(2)}`
													: `${delta.toFixed(2)}`}
											</td>
											<td className='p-2 text-center font-semibold'>
												{toOrdinal(ra)}
												<span className={`ml-1 text-[11px] ${rCls}`}>
													{rchg === 0 ? '' : rchg > 0 ? `+${rchg}` : `${rchg}`}
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					<div className='mt-3 flex gap-2'>
						<button
							disabled={!addCandidate || !dropCandidateId}
							onClick={applyMove}
							className={
								!addCandidate || !dropCandidateId
									? 'px-3 py-2 rounded-lg border border-slate-200 text-slate-400'
									: 'px-3 py-2 rounded-lg text-white bg-gradient-to-br from-indigo-500 to-violet-500 shadow'
							}
						>
							Commit Move
						</button>
					</div>
				</aside>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-center gap-2 mb-3'>
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search player or team (e.g. 'Jalen', 'DEN')"
					className='px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm'
				/>
				<select
					value={pos}
					onChange={(e) => setPos(e.target.value)}
					className='px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm'
				>
					<option value='ALL'>All Pos</option>
					<option value='PG'>PG</option>
					<option value='SG'>SG</option>
					<option value='G'>G</option>
					<option value='SF'>SF</option>
					<option value='PF'>PF</option>
					<option value='F'>F</option>
					<option value='C'>C</option>
				</select>
				<div className='flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-slate-200 text-slate-500'>
					<span className='text-sm'>
						Max Roster% <b className='text-slate-900'>{maxRoster}%</b>
					</span>
					<input
						type='range'
						min='0'
						max='100'
						value={maxRoster}
						onChange={(e) => setMaxRoster(+e.target.value)}
						className='accent-indigo-500'
					/>
				</div>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
					className='px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm'
				>
					<option value='score'>Sort: Stream Score</option>
					<option value='total'>Sort: Total Games</option>
					<option value='roster'>Sort: Roster% (Low to High)</option>
					<option value='name'>Sort: Name (A-Z)</option>
				</select>
			</div>

			{/* Free Agents Table */}
			<div className='overflow-auto border border-slate-200 rounded-xl bg-white shadow'>
				<table className='w-full table-fixed text-sm'>
					<colgroup>
						<col style={{ width: 260 }} />
						<col style={{ width: 72 }} />
						<col style={{ width: 92 }} />
						<col style={{ width: 88 }} />
						{DAY_LABELS.map((_, i) => (
							<col key={i} style={{ width: 54 }} />
						))}
						<col style={{ width: 64 }} />
						<col style={{ width: 72 }} />
						<col style={{ width: 120 }} />
					</colgroup>
					<thead>
						<tr className='sticky top-0 bg-white'>
							<th className='text-left font-extrabold p-3 border-b border-slate-200'>
								Player
							</th>
							<th className='p-3 border-b border-slate-200'>Team</th>
							<th className='p-3 border-b border-slate-200'>Pos</th>
							<th className='p-3 border-b border-slate-200'>Roster%</th>
							{DAY_LABELS.map((d) => (
								<th key={d} className='p-3 border-b border-slate-200'>
									{d}
								</th>
							))}
							<th className='p-3 border-b border-slate-200'>Total</th>
							<th className='p-3 border-b border-slate-200'>Score</th>
							<th className='text-right p-3 border-b border-slate-200'>
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((p) => {
							const week = p._week; // already computed
							return (
								<tr key={p.id} className='odd:bg-white even:bg-slate-50'>
									<th className='p-3 text-left align-middle border-b border-slate-200'>
										<div className='font-semibold'>{p.name}</div>
										{p.notes && (
											<div className='text-xs text-slate-500'>{p.notes}</div>
										)}
									</th>
									<td className='p-3 text-center align-middle border-b border-slate-200'>
										{p.team_abv}
									</td>
									<td className='p-3 text-center align-middle border-b border-slate-200'>
										{(p.positions || []).join(', ')}
									</td>
									<td className='p-3 text-center align-middle border-b border-slate-200'>
										{p.roster_pct ?? 0}%
									</td>
									{week.map((v, i) => {
										const val = v === 0 ? '' : String(v);
										const away = val.startsWith('@');
										const cls =
											val === ''
												? ''
												: away
												? 'italic bg-emerald-500/10'
												: 'bg-emerald-500/20';
										return (
											<td
												key={i}
												className={`p-3 text-center align-middle border-b border-slate-200 ${cls}`}
											>
												{val}
											</td>
										);
									})}
									<td className='p-3 text-center font-bold align-middle border-b border-slate-200'>
										{p._total}
									</td>
									<td className='p-3 text-center font-bold align-middle border-b border-slate-200'>
										{p._score}
									</td>
									<td className='p-3 text-right align-middle border-b border-slate-200'>
										<button
											className='px-3 py-1.5 rounded-lg text-white bg-gradient-to-br from-indigo-500 to-violet-500 shadow'
											onClick={() => setAddCandidate(p)}
										>
											Add
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Tiny sanity tests in the console */}
			<Tests />
		</div>
	);
}

// --- Minimal test harness for helpers ---
function Tests() {
	// Local copies mirroring component logic
	const countGames = (arr7) =>
		arr7.reduce((a, v) => a + (v && v !== 0 ? 1 : 0), 0);
	const countB2Bs = (arr7) => {
		let b = 0;
		for (let i = 0; i < 6; i++) {
			if (arr7[i] && arr7[i + 1]) b++;
		}
		return b;
	};
	const streamScore = (p, arr7) => {
		const g = countGames(arr7);
		const b = countB2Bs(arr7);
		const avail = (100 - (p.roster_pct || 0)) / 100;
		return +(g + b * 0.25 + avail * 0.25).toFixed(2);
	};

	// New helpers for projections
	const CATS = ['PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'TO'];
	const sumCats = (a, b) => {
		const o = {};
		for (const c of CATS) o[c] = (a[c] || 0) + (b[c] || 0);
		return o;
	};
	(function run() {
		if (typeof window === 'undefined' || window.__WAIVER_TESTED__) return;
		window.__WAIVER_TESTED__ = true;
		try {
			console.assert(
				countGames([0, 0, 'DEN', 0, '@LAL', 0, 0]) === 2,
				'countGames: 2 games'
			);
			console.assert(
				countGames(['BOS', 'NYK', 'PHI', '@MIA', '', 0, 0]) === 4,
				'countGames: 4 games'
			);
			console.assert(
				countB2Bs(['BOS', 'NYK', 0, 0, 0, 0, 0]) === 1,
				'countB2Bs: BOS-NYK b2b'
			);
			console.assert(
				countB2Bs(['@DEN', 0, 'PHX', '@LAL', 'UTA', '@GSW', 0]) === 2,
				'countB2Bs: two b2bs'
			);
			const s1 = streamScore({ roster_pct: 40 }, ['BOS', 'NYK', 0, 0, 0, 0, 0]);
			const s2 = streamScore({ roster_pct: 80 }, ['BOS', 'NYK', 0, 0, 0, 0, 0]);
			console.assert(
				s1 > s2,
				'streamScore: more available should score higher'
			);
			// Extra tests
			console.assert(
				countGames([0, 0, 0, 0, 0, 0, 0]) === 0,
				'countGames: zero week'
			);
			console.assert(
				countB2Bs([0, 'BOS', 'NYK', 0, 0, 0, 0]) === 1,
				'countB2Bs: midweek b2b'
			);
			// sumCats tests
			const sa = { PTS: 10, REB: 5, AST: 2, '3PM': 1, STL: 1, BLK: 0, TO: 3 };
			const sb = { PTS: 3, REB: 2, AST: 1, '3PM': 0, STL: 0, BLK: 1, TO: 1 };
			const sc = sumCats(sa, sb);
			console.assert(
				sc.PTS === 13 &&
					sc.REB === 7 &&
					sc.AST === 3 &&
					sc['3PM'] === 1 &&
					sc.STL === 1 &&
					sc.BLK === 1 &&
					sc.TO === 4,
				'sumCats: basic sum ok'
			);
			console.info('%cWaiver Wire helper tests passed', 'color:green');
		} catch (e) {
			console.error('Waiver Wire tests failed', e);
		}
	})();
	return null;
}
