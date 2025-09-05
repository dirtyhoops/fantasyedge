'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';

export default function WaiverWire() {
	// ===== Constants =====
	const CORE_CATS = ['PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'TO'];
	const ALL_CATS = ['FG%', 'FT%', ...CORE_CATS];
	const TEAMS = [
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
	const DAY_BADGES = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

	const [scope, setScope] = useState('remaining'); // 'remaining' | 'season'

	// ===== Mock players (same set; trimmed here for brevity if needed) =====
	const PLAYERS = [
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
		},
		{
			id: 'p21',
			name: 'Pat Connaughton',
			team_abv: 'MIL',
			positions: ['SG', 'SF'],
			roster_pct: 12,
			notes: '3PM/REB wing'
		},
		{
			id: 'p22',
			name: 'Jonathan Isaac',
			team_abv: 'ORL',
			positions: ['PF'],
			roster_pct: 19,
			notes: 'STL/BLK specialist'
		},
		{
			id: 'p23',
			name: 'Onyeka Okongwu',
			team_abv: 'ATL',
			positions: ['C'],
			roster_pct: 55,
			notes: 'Boards/Blocks'
		},
		{
			id: 'p24',
			name: 'Malik Monk',
			team_abv: 'SAC',
			positions: ['SG'],
			roster_pct: 63,
			notes: 'Points/3s burst'
		},
		{
			id: 'p25',
			name: 'Jalen Johnson',
			team_abv: 'ATL',
			positions: ['SF', 'PF'],
			roster_pct: 61,
			notes: 'All-around F'
		},
		{
			id: 'p26',
			name: 'Aaron Nesmith',
			team_abv: 'IND',
			positions: ['SG', 'SF'],
			roster_pct: 44,
			notes: '3&D wing'
		},
		{
			id: 'p27',
			name: 'DeAnthony Melton',
			team_abv: 'PHI',
			positions: ['PG', 'SG'],
			roster_pct: 46,
			notes: 'STL/3s guard'
		},
		{
			id: 'p28',
			name: 'Tari Eason',
			team_abv: 'HOU',
			positions: ['SF', 'PF'],
			roster_pct: 35,
			notes: 'Stocks upside'
		},
		{
			id: 'p29',
			name: 'Kelly Olynyk',
			team_abv: 'TOR',
			positions: ['C'],
			roster_pct: 47,
			notes: 'AST big'
		},
		{
			id: 'p30',
			name: 'Bruce Brown',
			team_abv: 'TOR',
			positions: ['SG', 'SF'],
			roster_pct: 39,
			notes: 'Across-the-board'
		},
		{
			id: 'p31',
			name: 'PJ Washington',
			team_abv: 'DAL',
			positions: ['PF'],
			roster_pct: 58,
			notes: 'PF with 3s'
		},
		{
			id: 'p32',
			name: 'Jabari Smith Jr.',
			team_abv: 'HOU',
			positions: ['PF', 'C'],
			roster_pct: 69,
			notes: 'Stretch big'
		},
		{
			id: 'p33',
			name: 'Scoot Henderson',
			team_abv: 'POR',
			positions: ['PG'],
			roster_pct: 64,
			notes: 'AST/PTS'
		},
		{
			id: 'p34',
			name: 'Anfernee Simons',
			team_abv: 'POR',
			positions: ['SG'],
			roster_pct: 76,
			notes: 'High-usage scorer'
		},
		{
			id: 'p35',
			name: 'Matisse Thybulle',
			team_abv: 'POR',
			positions: ['SG', 'SF'],
			roster_pct: 22,
			notes: 'STL specialist'
		},
		{
			id: 'p36',
			name: 'Herb Jones',
			team_abv: 'NOP',
			positions: ['SF', 'PF'],
			roster_pct: 70,
			notes: 'Elite stocks'
		},
		{
			id: 'p37',
			name: 'Dyson Daniels',
			team_abv: 'NOP',
			positions: ['PG', 'SG'],
			roster_pct: 28,
			notes: 'STL/AST guard'
		},
		{
			id: 'p38',
			name: 'Al Horford',
			team_abv: 'BOS',
			positions: ['C'],
			roster_pct: 45,
			notes: 'AST/3s big'
		},
		{
			id: 'p39',
			name: 'Keita Bates-Diop',
			team_abv: 'BKN',
			positions: ['SF', 'PF'],
			roster_pct: 13,
			notes: 'Deep streamer'
		},
		{
			id: 'p40',
			name: 'Immanuel Quickley',
			team_abv: 'TOR',
			positions: ['PG', 'SG'],
			roster_pct: 72,
			notes: 'Scoring PG'
		},
		{
			id: 'p41',
			name: 'Josh Green',
			team_abv: 'DAL',
			positions: ['SG', 'SF'],
			roster_pct: 24,
			notes: '3s/steals'
		},
		{
			id: 'p42',
			name: 'Nicolas Batum',
			team_abv: 'PHI',
			positions: ['SF', 'PF'],
			roster_pct: 27,
			notes: 'Glue stats/3s'
		},
		{
			id: 'p43',
			name: 'Walker Kessler',
			team_abv: 'UTA',
			positions: ['C'],
			roster_pct: 74,
			notes: 'Blocks anchor'
		},
		{
			id: 'p44',
			name: 'Keyonte George',
			team_abv: 'UTA',
			positions: ['PG', 'SG'],
			roster_pct: 36,
			notes: 'Scoring guard'
		},
		{
			id: 'p45',
			name: 'Collin Sexton',
			team_abv: 'UTA',
			positions: ['PG', 'SG'],
			roster_pct: 59,
			notes: 'PTS/FG%'
		},
		{
			id: 'p46',
			name: 'Santi Aldama',
			team_abv: 'MEM',
			positions: ['PF', 'C'],
			roster_pct: 33,
			notes: 'Stretch big'
		},
		{
			id: 'p47',
			name: 'Luke Kennard',
			team_abv: 'MEM',
			positions: ['SG'],
			roster_pct: 31,
			notes: '3PM specialist'
		},
		{
			id: 'p48',
			name: 'Jaden Ivey',
			team_abv: 'DET',
			positions: ['PG', 'SG'],
			roster_pct: 62,
			notes: 'PTS/AST'
		},
		{
			id: 'p49',
			name: 'Ausar Thompson',
			team_abv: 'DET',
			positions: ['SG', 'SF'],
			roster_pct: 54,
			notes: 'REB/STL/BLK wing'
		},
		{
			id: 'p50',
			name: 'Marcus Sasser',
			team_abv: 'DET',
			positions: ['PG'],
			roster_pct: 18,
			notes: '3s/AST bench'
		}
	];

	// ===== RNG & per-game projections =====
	const seeded = (s) => {
		let h = 2166136261 >>> 0;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619) >>> 0;
		}
		return () => {
			h ^= h << 13;
			h >>>= 0;
			h ^= h >>> 17;
			h >>>= 0;
			h ^= h << 5;
			h >>>= 0;
			return (h >>> 0) / 4294967296;
		};
	};
	const PROJ_PG = useMemo(() => {
		const obj = {};
		for (const p of PLAYERS) {
			const rnd = seeded(p.id);
			const PTS = +(8 + rnd() * 18).toFixed(1);
			const REB = +(2 + rnd() * 8).toFixed(1);
			const AST = +(1 + rnd() * 7).toFixed(1);
			const THR = +(0.5 + rnd() * 3.5).toFixed(1);
			const STL = +(0.3 + rnd() * 1.2).toFixed(1);
			const BLK = +(0.2 + rnd() * 1.4).toFixed(1);
			const TO = +(0.8 + rnd() * 2.5).toFixed(1);
			obj[p.id] = { PTS, REB, AST, '3PM': THR, STL, BLK, TO };
		}
		return obj;
	}, []);

	// ===== Week helpers =====
	function genWeek(teamAbv, weekIndex) {
		const rnd = seeded(teamAbv + ':' + weekIndex);
		const slots = Array(7).fill(0);
		const games = rnd() < 0.25 ? 5 : rnd() < 0.6 ? 4 : 3;
		let placed = 0;
		while (placed < games) {
			const d = Math.floor(rnd() * 7);
			if (!slots[d]) {
				const opp = TEAMS[Math.floor(rnd() * TEAMS.length)];
				slots[d] = rnd() < 0.5 ? '@' + opp : opp;
				placed++;
			}
		}
		return slots;
	}
	const getWeekArray = (team_abv) => genWeek(team_abv, 1);
	const countGames = (arr7) => arr7.reduce((a, v) => a + (v ? 1 : 0), 0);
	const jsDay = new Date().getDay(); // 0=Sun..6=Sat
	const todayIndex = (jsDay + 6) % 7; // 0=Mon..6=Sun
	const remainingGames = (arr7) =>
		arr7.slice(todayIndex).reduce((a, v) => a + (v ? 1 : 0), 0);
	const remainingDayBadges = (arr7) => {
		const out = [];
		for (let i = todayIndex; i < 7; i++) if (arr7[i]) out.push(DAY_BADGES[i]);
		return out;
	};

	// ===== ROS (demo) =====
	const seasonRemainingGames = (team_abv) => {
		const rnd = seeded('ROS:' + team_abv);
		return 55 + Math.floor(rnd() * 20);
	};
	const gamesForScope = (team_abv, s = scope) =>
		s === 'season'
			? seasonRemainingGames(team_abv)
			: remainingGames(getWeekArray(team_abv));

	// ===== Roster / FA state =====
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
	];
	const [rosterIds, setRosterIds] = useState(initialRosterIds);
	const rosterSet = useMemo(() => new Set(rosterIds), [rosterIds]);
	const rosterPlayers = useMemo(
		() => PLAYERS.filter((p) => rosterSet.has(p.id)),
		[rosterSet]
	);

	const [addCandidate, setAddCandidate] = useState(null);
	const [dropCandidateId, setDropCandidateId] = useState(null);
	const [showModal, setShowModal] = useState(false);
	useEffect(() => {
		setShowModal(!!addCandidate && !!dropCandidateId);
	}, [addCandidate, dropCandidateId]);

	// ===== Filters / sorts =====
	const [posFilter, setPosFilter] = useState('ALL');
	const [sortByFA, setSortByFA] = useState('left');
	const matchesPos = (player) => {
		if (posFilter === 'ALL') return true;
		const posArr = player.positions || [];
		if (posFilter === 'G') return posArr.some((x) => x === 'PG' || x === 'SG');
		if (posFilter === 'F') return posArr.some((x) => x === 'SF' || x === 'PF');
		return posArr.includes(posFilter);
	};

	const streamScore = (p, arr7) => {
		const g = countGames(arr7);
		let b2b = 0;
		for (let i = 0; i < 6; i++) {
			if (arr7[i] && arr7[i + 1]) b2b++;
		}
		const avail = (100 - (p.roster_pct || 0)) / 100;
		return +(g + b2b * 0.25 + avail * 0.25).toFixed(2);
	};

	const freeAgentsRaw = useMemo(() => {
		return PLAYERS.filter((p) => !rosterSet.has(p.id)).map((p) => {
			const week = getWeekArray(p.team_abv);
			return {
				...p,
				_week: week,
				_total: countGames(week),
				_left: remainingGames(week),
				_badges: remainingDayBadges(week),
				_score: streamScore(p, week)
			};
		});
	}, [rosterSet, todayIndex]);

	const freeAgents = useMemo(() => {
		const rows = freeAgentsRaw.filter(matchesPos);
		switch (sortByFA) {
			case 'left':
				return rows.sort(
					(a, b) =>
						b._left - a._left ||
						b._total - a._total ||
						a.name.localeCompare(b.name)
				);
			case 'roster':
				return rows.sort((a, b) => (a.roster_pct ?? 0) - (b.roster_pct ?? 0));
			case 'name':
				return rows.sort((a, b) => a.name.localeCompare(b.name));
			default:
				return rows.sort(
					(a, b) =>
						b._score - a._score || b._left - a._left || b._total - a._total
				);
		}
	}, [freeAgentsRaw, posFilter, sortByFA]);

	// ===== Projections / ranks =====
	function deriveShootingPerGame(id) {
		const b = PROJ_PG[id] || { PTS: 0, '3PM': 0, AST: 0 };
		const threes = Math.max(0, b['3PM'] || 0);
		const pts = Math.max(0, b.PTS || 0);
		let FGA = Math.min(22, Math.max(6, 8 + pts / 2));
		let FGp = Math.max(0.4, Math.min(0.58, 0.45 + threes * 0.01));
		let FGM = FGp * FGA;
		let FTA = Math.min(10, Math.max(1, 3 + pts / 10));
		let FTp = Math.max(0.65, Math.min(0.9, 0.75 + (b.AST || 0 + pts) / 120));
		let FTM = FTp * FTA;
		return { FGM, FGA, FTM, FTA };
	}
	const totalsForPlayerScope = (p, s = scope) => {
		const g = gamesForScope(p.team_abv, s);
		const base = PROJ_PG[p.id] || {
			PTS: 0,
			REB: 0,
			AST: 0,
			'3PM': 0,
			STL: 0,
			BLK: 0,
			TO: 0
		};
		const shoot = deriveShootingPerGame(p.id);
		const out = {
			PTS: base.PTS * g,
			REB: base.REB * g,
			AST: base.AST * g,
			'3PM': base['3PM'] * g,
			STL: base.STL * g,
			BLK: base.BLK * g,
			TO: base.TO * g,
			FGM: shoot.FGM * g,
			FGA: shoot.FGA * g,
			FTM: shoot.FTM * g,
			FTA: shoot.FTA * g
		};
		for (const k of Object.keys(out))
			out[k] = +out[k].toFixed(k === 'TO' ? 1 : 2);
		return out;
	};
	const computeTeamTotals = (arr, s = scope) =>
		arr.reduce((t, p) => {
			const w = totalsForPlayerScope(p, s);
			const o = { ...t };
			for (const k in w) o[k] = (o[k] || 0) + w[k];
			return o;
		}, {});

	const baselineRosterIdsRef = useRef(initialRosterIds);
	const baselinePlayers = useMemo(
		() => PLAYERS.filter((p) => baselineRosterIdsRef.current.includes(p.id)),
		[PLAYERS]
	);
	const baselineTotals = useMemo(
		() => computeTeamTotals(baselinePlayers, scope),
		[baselinePlayers, scope]
	);

	const projectedTotals = useMemo(() => {
		let current = rosterPlayers;
		if (addCandidate && dropCandidateId)
			current = current
				.filter((p) => p.id !== dropCandidateId)
				.concat(addCandidate);
		return computeTeamTotals(current, scope);
	}, [rosterPlayers, addCandidate, dropCandidateId, scope]);

	const OTHER_TEAMS = [
		{
			PTS: 520,
			REB: 210,
			AST: 140,
			'3PM': 80,
			STL: 42,
			BLK: 28,
			TO: 85,
			'FG%': 47.5,
			'FT%': 78.5
		},
		{
			PTS: 480,
			REB: 230,
			AST: 150,
			'3PM': 70,
			STL: 38,
			BLK: 35,
			TO: 92,
			'FG%': 46.2,
			'FT%': 76.0
		},
		{
			PTS: 505,
			REB: 205,
			AST: 160,
			'3PM': 92,
			STL: 47,
			BLK: 31,
			TO: 88,
			'FG%': 48.0,
			'FT%': 79.8
		},
		{
			PTS: 495,
			REB: 215,
			AST: 145,
			'3PM': 86,
			STL: 44,
			BLK: 29,
			TO: 91,
			'FG%': 45.5,
			'FT%': 77.1
		}
	];
	const fmtPct = (v) => `${v.toFixed(1)}%`;
	const valueForDisplay = (cat, totals) => {
		if (cat === 'FG%')
			return totals.FGA > 0 ? (totals.FGM / totals.FGA) * 100 : 0;
		if (cat === 'FT%')
			return totals.FTA > 0 ? (totals.FTM / totals.FTA) * 100 : 0;
		return totals[cat] || 0;
	};
	const rankPosition = (cat, mine, others) => {
		let better = 0;
		for (const o of others) {
			const ov = o[cat] ?? 0;
			if (cat === 'TO') {
				if (ov < mine) better++;
			} else {
				if (ov > mine) better++;
			}
		}
		return better + 1;
	};
	const ordinal = (n) => {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
	};
	const baselineRanks = useMemo(() => {
		const r = {};
		for (const c of ALL_CATS)
			r[c] = rankPosition(c, valueForDisplay(c, baselineTotals), OTHER_TEAMS);
		return r;
	}, [baselineTotals]);
	const projectedRanks = useMemo(() => {
		const r = {};
		for (const c of ALL_CATS)
			r[c] = rankPosition(c, valueForDisplay(c, projectedTotals), OTHER_TEAMS);
		return r;
	}, [projectedTotals]);
	const deltaChipClass = (cat, diff) => {
		if (diff === 0) return 'chip';
		const beneficial =
			cat === 'TO'
				? diff < 0
				: cat === 'FG%' || cat === 'FT%'
				? diff > 0
				: diff > 0;
		return beneficial ? 'chip good' : 'chip bad';
	};

	const applyMove = () => {
		if (!addCandidate || !dropCandidateId) return;
		setRosterIds((prev) =>
			prev.filter((id) => id !== dropCandidateId).concat(addCandidate.id)
		);
		setAddCandidate(null);
		setDropCandidateId(null);
		setShowModal(false);
	};
	const cancelMove = () => {
		setAddCandidate(null);
		setDropCandidateId(null);
		setShowModal(false);
	};

	// ===== Height sync: FA card matches roster card; FA table scrolls inside =====
	const rosterCardRef = useRef(null);
	const faCardRef = useRef(null);
	const faHeadRef = useRef(null);
	const [faCardHeight, setFaCardHeight] = useState(null);

	useEffect(() => {
		if (!rosterCardRef.current) return;

		const ro = new ResizeObserver(() => {
			const rosterH = Math.round(
				rosterCardRef.current.getBoundingClientRect().height
			);
			setFaCardHeight(rosterH);
		});
		ro.observe(rosterCardRef.current);

		// initial measure
		const rosterH = Math.round(
			rosterCardRef.current.getBoundingClientRect().height
		);
		setFaCardHeight(rosterH);

		const onResize = () => {
			const h = Math.round(
				rosterCardRef.current.getBoundingClientRect().height
			);
			setFaCardHeight(h);
		};
		window.addEventListener('resize', onResize);
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', onResize);
		};
	}, []);

	// compute scrollable height for FA inner table
	const [faInnerMax, setFaInnerMax] = useState(320);
	useEffect(() => {
		if (!faCardRef.current || !faHeadRef.current || !faCardHeight) return;
		const headH = Math.round(faHeadRef.current.getBoundingClientRect().height);
		const inner = Math.max(200, faCardHeight - headH - 8); // padding buffer
		setFaInnerMax(inner);
	}, [faCardHeight]);

	// ===== Icons =====
	const IconUp = () => (
		<svg width='10' height='10' viewBox='0 0 24 24' aria-hidden='true'>
			<path
				d='M6 14l6-6 6 6'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
	const IconDown = () => (
		<svg width='10' height='10' viewBox='0 0 24 24' aria-hidden='true'>
			<path
				d='M18 10l-6 6-6-6'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);

	const scopeTitle =
		scope === 'season'
			? 'Rest-of-Season Category Ranks — Projected vs Baseline'
			: 'Rest-of-Week Category Ranks — Projected vs Baseline (Week 1)';

	return (
		<div className='ww'>
			{/* Ranks */}
			<section className='card'>
				<div className='card-head'>
					<h2>{scopeTitle}</h2>
					<div className='filters'>
						<select value={scope} onChange={(e) => setScope(e.target.value)}>
							<option value='remaining'>Rest of Week</option>
							<option value='season'>Rest of Season</option>
						</select>
					</div>
				</div>
				<div className='rank-row'>
					{ALL_CATS.map((cat) => {
						const baseVal = valueForDisplay(cat, baselineTotals);
						const projVal = valueForDisplay(cat, projectedTotals);
						const baseRank = baselineRanks[cat];
						const projRank = projectedRanks[cat];
						const diff = +(projVal - baseVal).toFixed(
							cat.endsWith('%') ? 1 : 1
						);
						const rankDelta = baseRank - projRank;
						return (
							<div key={cat} className='rank-card'>
								<div className='rank-cat'>{cat}</div>
								<div className='rank-main'>
									<span className='rank-after'>{ordinal(projRank)}</span>
									{rankDelta !== 0 && (
										<span
											className={`rank-delta ${rankDelta > 0 ? 'up' : 'down'}`}
										>
											{rankDelta > 0 ? <IconUp /> : <IconDown />}
											<span className='rank-delta-num'>
												{rankDelta > 0 ? `+${rankDelta}` : rankDelta}
											</span>
										</span>
									)}
								</div>
								<div className='totals-line'>
									<span className='total-val'>
										{cat.endsWith('%') ? fmtPct(projVal) : projVal.toFixed(0)}
									</span>
									<span className={deltaChipClass(cat, diff)}>
										{diff > 0 ? '+' : ''}
										{cat.endsWith('%') ? `${diff}%` : `${diff}`}
									</span>
								</div>
								<div className='subline tiny muted'>
									baseline: {ordinal(baseRank)} •{' '}
									{cat.endsWith('%') ? fmtPct(baseVal) : baseVal.toFixed(0)}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Main: FA (left) matches roster card height (right). FA inner scrolls. */}
			<div className='two-col'>
				{/* Free Agents */}
				<section
					className='card pane'
					ref={faCardRef}
					style={faCardHeight ? { height: faCardHeight + 'px' } : undefined}
				>
					<div className='card-head' ref={faHeadRef}>
						<h3>Free Agents / Waiver Wire</h3>
						<div className='filters right'>
							<span className='count-badge'>{freeAgents.length} FA</span>
							<select
								value={posFilter}
								onChange={(e) => setPosFilter(e.target.value)}
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
							<select
								value={sortByFA}
								onChange={(e) => setSortByFA(e.target.value)}
							>
								<option value='left'>Sort: Games Left (wk)</option>
								<option value='roster'>Sort: Roster% (Low → High)</option>
								<option value='score'>Sort: StreamScore</option>
								<option value='name'>Sort: Name (A→Z)</option>
							</select>
						</div>
					</div>

					<div className='pane-body'>
						<div
							className='table-wrap fa-scroll'
							style={{ maxHeight: faInnerMax }}
						>
							<table className='table small'>
								<thead>
									<tr>
										<th className='left'>Player</th>
										<th>Team</th>
										<th>Pos</th>
										<th>Roster%</th>
										<th>Games Left</th>
										<th>Score</th>
										<th className='right'>Action</th>
									</tr>
								</thead>
								<tbody>
									{freeAgents.map((p) => {
										const selected = addCandidate?.id === p.id;
										return (
											<tr
												key={p.id}
												className={selected ? 'row-add-select' : undefined}
											>
												<td className='left'>
													<div className='name-line'>{p.name}</div>
													{p.notes && (
														<div className='tiny muted'>{p.notes}</div>
													)}
												</td>
												<td className='center'>{p.team_abv}</td>
												<td className='center'>
													{(p.positions || []).join(', ')}
												</td>
												<td className='center'>{p.roster_pct ?? 0}%</td>
												<td className='center'>
													{p._left === 0 ? (
														<span className='left-num'>0</span>
													) : (
														<span className='badges'>
															{p._badges.map((b, i) => (
																<span key={i} className='day-badge'>
																	{b}
																</span>
															))}
														</span>
													)}
												</td>
												<td className='center strong'>{p._score}</td>
												<td className='right'>
													{selected ? (
														<button
															className='btn btn-danger'
															onClick={() => setAddCandidate(null)}
														>
															Undo
														</button>
													) : (
														<button
															className='btn btn-primary'
															onClick={() => setAddCandidate(p)}
														>
															Add
														</button>
													)}
												</td>
											</tr>
										);
									})}
									{freeAgents.length === 0 && (
										<tr>
											<td className='left' colSpan={7}>
												No players match your filters.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* Roster (drives height) */}
				<section className='card pane' ref={rosterCardRef}>
					<div className='card-head'>
						<h3>My Roster (Week 1)</h3>
						<span className='muted tiny'>Click “Drop” to mark a player</span>
					</div>
					<div className='table-wrap'>
						<table className='table small'>
							<thead>
								<tr>
									<th className='left'>Player</th>
									<th>Team</th>
									<th>Pos</th>
									<th>Games Left</th>
									<th className='right'>Action</th>
								</tr>
							</thead>
							<tbody>
								{rosterPlayers.map((p) => {
									const weekArr = getWeekArray(p.team_abv);
									const left = remainingGames(weekArr);
									const selected = dropCandidateId === p.id;
									return (
										<tr
											key={p.id}
											className={selected ? 'row-select' : undefined}
										>
											<td className='left'>
												<div className='name-line'>{p.name}</div>
												{p.notes && <div className='tiny muted'>{p.notes}</div>}
											</td>
											<td className='center'>{p.team_abv}</td>
											<td className='center'>{p.positions.join(', ')}</td>
											<td className='center'>{left}</td>
											<td className='right'>
												<button
													className={selected ? 'btn btn-danger' : 'btn'}
													onClick={() =>
														setDropCandidateId(selected ? null : p.id)
													}
													aria-pressed={selected ? 'true' : 'false'}
												>
													{selected ? 'Undo' : 'Drop'}
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</section>
			</div>

			{/* Modal */}
			{showModal && (
				<div className='modal-mask' role='dialog' aria-modal='true'>
					<div className='modal'>
						<div className='modal-head'>
							<h3>Confirm Pickup</h3>
							<button
								className='btn ghost'
								onClick={cancelMove}
								aria-label='Close'
							>
								✕
							</button>
						</div>
						<div className='modal-body'>
							<div className='modal-col'>
								<div className='slot-label'>Drop</div>
								{dropCandidateId ? (
									(() => {
										const p = rosterPlayers.find(
											(x) => x.id === dropCandidateId
										);
										return (
											<div className='slot-box danger'>
												<div className='name-line'>{p?.name}</div>
												<div className='tiny muted'>
													{p?.team_abv} • {(p?.positions || []).join(', ')}
												</div>
											</div>
										);
									})()
								) : (
									<div className='slot-placeholder'>Select a roster player</div>
								)}
							</div>
							<div className='modal-col'>
								<div className='slot-label'>Add</div>
								{addCandidate ? (
									<div className='slot-box primary'>
										<div className='name-line'>{addCandidate.name}</div>
										<div className='tiny muted'>
											{addCandidate.team_abv} •{' '}
											{(addCandidate.positions || []).join(', ')}
										</div>
									</div>
								) : (
									<div className='slot-placeholder'>Select a free agent</div>
								)}
							</div>
						</div>
						<div className='modal-actions'>
							<button className='btn' onClick={cancelMove}>
								Cancel
							</button>
							<button
								className='btn btn-primary'
								onClick={applyMove}
								disabled={!addCandidate || !dropCandidateId}
							>
								Confirm Pickup
							</button>
						</div>
					</div>
				</div>
			)}

			<style>{`
        :root{
          --bg:#ffffff; --card:#ffffff; --fg:#0f172a; --muted:#6b7280; --border:#e5e7eb;
          --shadow: 0 8px 24px rgba(2,6,23,.08);
          --good:#059669; --bad:#dc2626; --ink:#111827;
          --gradFrom:#6366f1; --gradTo:#8b5cf6;
          --badgeBg:#f1f5f9; --badgeBd:#e2e8f0; --badgeFg:#334155;
          --thead:#ffffff; --rowSel:#fff1f2; --rowAdd:#eff6ff;
          --badgeDayBg:#eef2ff; --badgeDayBd:#e0e7ff; --badgeDayFg:#3730a3;
          --modalScrim: rgba(0,0,0,.45);
        }
        [data-theme="dark"]{
          --bg:#0b1020; --card:#0f1528; --fg:#e5e7eb; --muted:#9ca3af; --border:#1f2a44;
          --shadow: 0 8px 24px rgba(0,0,0,.5);
          --good:#34d399; --bad:#f87171; --ink:#f8fafc;
          --gradFrom:#8b5cf6; --gradTo:#60a5fa;
          --badgeBg:#0b1224; --badgeBd:#1f2a44; --badgeFg:#cbd5e1;
          --thead:#0f1528; --rowSel:rgba(244,63,94,0.08); --rowAdd:rgba(59,130,246,0.10);
          --badgeDayBg:rgba(99,102,241,0.12); --badgeDayBd:rgba(99,102,241,0.3); --badgeDayFg:#c7d2fe;
          --modalScrim: rgba(0,0,0,.6);
        }

        .ww { min-height:100vh; background:var(--bg); color:var(--fg);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 20px 16px; }

        .muted { color:var(--muted); } .tiny { font-size:11px; }

        .card { border:1px solid var(--border); border-radius:14px; background:var(--card); box-shadow: var(--shadow); overflow:hidden; }
        .card-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; border-bottom:1px solid var(--border); }
        .card-head h2, .card-head h3 { margin:0; font-weight:800; letter-spacing:-0.01em; color:var(--ink); font-size:16px; }

        .filters select { border:1px solid var(--border); border-radius:10px; padding:8px 12px; background:var(--card); color:var(--fg); }
        .filters.right { display:flex; align-items:center; gap:8px; }
        .count-badge { font-size:11px; font-weight:800; color:var(--badgeFg); padding:4px 8px; border-radius:999px; background:var(--badgeBg); border:1px solid var(--badgeBd); }

        .rank-row { display:grid; gap:10px; padding:12px; grid-template-columns: repeat(9, minmax(110px,1fr)); overflow:auto; }
        .rank-card { border:1px solid var(--border); border-radius:12px; padding:10px; background:var(--card); box-shadow: var(--shadow); }
        .rank-cat { font-size:11px; color:var(--muted); margin-bottom:4px; }
        .rank-main { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px; }
        .rank-after { font-size:20px; font-weight:800; letter-spacing:-0.01em; }
        .rank-delta { display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border-radius:999px; border:1px solid var(--border); font-size:10px; font-weight:800; }
        .rank-delta.up { background:rgba(5,150,105,0.12); color:#065f46; border-color:rgba(5,150,105,0.25); }
        .rank-delta.down { background:rgba(220,38,38,0.10); color:#991b1b; border-color:rgba(220,38,38,0.25); }
        [data-theme="dark"] .rank-delta.up { background:rgba(52,211,153,0.15); color:#10b981; border-color:rgba(52,211,153,0.35); }
        [data-theme="dark"] .rank-delta.down { background:rgba(248,113,113,0.15); color:#ef4444; border-color:rgba(248,113,113,0.35); }
        .rank-delta-num { font-feature-settings: 'tnum' 1, 'lnum' 1; }

        .totals-line { display:flex; align-items:center; gap:8px; }
        .total-val { font-weight:800; }
        .subline { margin-top:6px; color:var(--muted); }

        .two-col { display:grid; gap:16px; grid-template-columns: 1fr; margin-top:16px; align-items: start; }
        @media (min-width: 1100px){ .two-col { grid-template-columns: 1.65fr 0.9fr; } }

        .pane { display:flex; flex-direction:column; }
        .pane-body { display:flex; flex-direction:column; flex:1; min-height:0; }
        .fa-scroll { overflow-y:auto; overflow-x:auto; min-height:0; }

        .table { width:100%; border-collapse:separate; border-spacing:0; table-layout: fixed; }
        .table.small { font-size:13px; }
        .table thead th { position:sticky; top:0; background:var(--thead); z-index:1; }
        .table th, .table td { padding:8px 10px; border-bottom:1px solid var(--border); vertical-align:middle; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
        .table th.left, .table td.left { text-align:left; }
        .table th.center, .table td.center { text-align:center; }
        .table th.right, .table td.right { text-align:right; }
        .table .strong { font-weight:700; }

        .name-line { font-weight:700; letter-spacing:-0.01em; }
        tr.row-select     { background: var(--rowSel); }
        tr.row-add-select { background: var(--rowAdd); }

        .badges { display:inline-flex; gap:4px; vertical-align:middle; }
        .day-badge { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; font-size:10px; font-weight:700; border-radius:6px; background:var(--badgeDayBg); color:var(--badgeDayFg); border:1px solid var(--badgeDayBd); }
        .left-num { font-weight:800; font-feature-settings: 'tnum' 1, 'lnum' 1; }

        .btn { appearance:none; border:1px solid var(--border); background:var(--card); color:var(--fg); border-radius:10px; padding:8px 12px; cursor:pointer; transition: box-shadow .15s, transform .15s; }
        .btn:hover { box-shadow: var(--shadow); transform: translateY(-1px); }
        .btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-primary { color:#fff; border-color:transparent; background-image: linear-gradient(135deg, var(--gradFrom), var(--gradTo)); }
        .btn-danger { background:rgba(248,113,113,0.1); color:#b91c1c; border-color:#fecaca; }
        [data-theme="dark"] .btn-danger { color:#fecaca; border-color:#7f1d1d; background:rgba(127,29,29,0.25); }
        .btn.ghost { background:transparent; }

        .modal-mask { position:fixed; inset:0; background:var(--modalScrim); display:flex; align-items:center; justify-content:center; padding:16px; z-index:100; }
        .modal { width:min(720px, 100%); background:var(--card); border:1px solid var(--border); border-radius:14px; box-shadow: 0 20px 60px rgba(2,6,23,.35); overflow:hidden; }
        .modal-head { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid var(--border); }
        .modal-head h3 { margin:0; font-size:16px; font-weight:800; color:var(--ink); }
        .modal-body { display:grid; grid-template-columns: 1fr 1fr; gap:12px; padding:14px; }
        .modal-col { display:grid; gap:8px; }
        .slot-label { font-size:12px; font-weight:800; color:var(--badgeFg); }
        .slot-placeholder { font-size:12px; color:var(--muted); border:1px dashed var(--border); border-radius:10px; padding:10px; }
        .slot-box { border:1px solid var(--border); border-radius:10px; padding:10px; background:var(--card); }
        .slot-box.primary { border-color:var(--badgeDayBd); background:rgba(99,102,241,0.06); }
        .slot-box.danger  { border-color:#fecaca; background:rgba(248,113,113,0.08); }
      `}</style>
		</div>
	);
}
