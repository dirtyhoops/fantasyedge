/* eslint-disable no-console */
// scripts/build-weekly-team-games.cjs
// Output (per team):
// {
//   team: "Denver Nuggets",
//   team_abv: "DEN",
//   weekly_games: [2,3,...],           // Mon→Sun weekly totals
//   "week_1": ["0","@UTA","0","PHX","0","0","0"], // Mon..Sun (0 or opponent abv, '@' if away)
//   "week_2": ["LAL","0","@SAC","0","0","MIN","0"],
//   ...
// }

const fs = require('fs/promises');
const path = require('path');
const https = require('https');

// --------- CONFIG ---------
const FEED_DEFAULT =
	process.env.FEED ||
	getFlag('feed') ||
	'https://fixturedownload.com/feed/json/nba-2025';
const WEEKS_TARGET = Number(process.env.WEEKS || getFlag('weeks') || 23);
const WEEK1_OVERRIDE = process.env.WEEK1 || getFlag('week1') || ''; // YYYY-MM-DD
const RANGE_START = process.env.START || getFlag('start') || ''; // YYYY-MM-DD inclusive
const RANGE_END = process.env.END || getFlag('end') || ''; // YYYY-MM-DD inclusive

const OUT_FILE = path.join(
	process.cwd(),
	'public',
	'data',
	'nba_2025_weekly_games.json'
);

// Full team name → ABV
const NAME_TO_ABV = {
	'Atlanta Hawks': 'ATL',
	'Boston Celtics': 'BOS',
	'Brooklyn Nets': 'BKN',
	'Charlotte Hornets': 'CHA',
	'Chicago Bulls': 'CHI',
	'Cleveland Cavaliers': 'CLE',
	'Dallas Mavericks': 'DAL',
	'Denver Nuggets': 'DEN',
	'Detroit Pistons': 'DET',
	'Golden State Warriors': 'GSW',
	'Houston Rockets': 'HOU',
	'Indiana Pacers': 'IND',
	'LA Clippers': 'LAC',
	'Los Angeles Lakers': 'LAL',
	'Memphis Grizzlies': 'MEM',
	'Miami Heat': 'MIA',
	'Milwaukee Bucks': 'MIL',
	'Minnesota Timberwolves': 'MIN',
	'New Orleans Pelicans': 'NOP',
	'New York Knicks': 'NYK',
	'Oklahoma City Thunder': 'OKC',
	'Orlando Magic': 'ORL',
	'Philadelphia 76ers': 'PHI',
	'Phoenix Suns': 'PHX',
	'Portland Trail Blazers': 'POR',
	'Sacramento Kings': 'SAC',
	'San Antonio Spurs': 'SAS',
	'Toronto Raptors': 'TOR',
	'Utah Jazz': 'UTA',
	'Washington Wizards': 'WAS'
};

// Aliases → Full name (to normalize feed variations)
const ALIAS_TO_NAME = {
	'Los Angeles Clippers': 'LA Clippers',
	'LA Lakers': 'Los Angeles Lakers',
	'NY Knicks': 'New York Knicks',
	'New Orleans Hornets': 'New Orleans Pelicans',
	'Portland Trailblazers': 'Portland Trail Blazers',
	'Golden St Warriors': 'Golden State Warriors',
	'San Antonio': 'San Antonio Spurs',
	'Oklahoma City': 'Oklahoma City Thunder',
	Phoenix: 'Phoenix Suns',
	Utah: 'Utah Jazz',
	Denver: 'Denver Nuggets',
	Portland: 'Portland Trail Blazers',
	Philadelphia: 'Philadelphia 76ers',
	Indiana: 'Indiana Pacers',
	Miami: 'Miami Heat',
	Milwaukee: 'Milwaukee Bucks',
	Orlando: 'Orlando Magic',
	Toronto: 'Toronto Raptors',
	Sacramento: 'Sacramento Kings',
	Dallas: 'Dallas Mavericks',
	Houston: 'Houston Rockets',
	Memphis: 'Memphis Grizzlies',
	Minnesota: 'Minnesota Timberwolves',
	Detroit: 'Detroit Pistons',
	Chicago: 'Chicago Bulls',
	Cleveland: 'Cleveland Cavaliers',
	Charlotte: 'Charlotte Hornets',
	Atlanta: 'Atlanta Hawks',
	Brooklyn: 'Brooklyn Nets',
	Boston: 'Boston Celtics',
	Washington: 'Washington Wizards',
	'New York': 'New York Knicks',
	'Oklahoma City Thunder (IST)': 'Oklahoma City Thunder'
};
const ABV_TO_NAME = Object.fromEntries(
	Object.entries(NAME_TO_ABV).map(([n, a]) => [a, n])
);

// --------- MAIN ---------
(async function main() {
	try {
		console.log('Fetching feed:', FEED_DEFAULT);
		const games = await getJSON(FEED_DEFAULT);

		const parsed = games
			.map(normalizeGame)
			.filter(Boolean)
			.filter((g) => {
				if (RANGE_START && g.date < toUtcMidnight(RANGE_START)) return false;
				if (RANGE_END && g.date > toUtcEndOfDay(RANGE_END)) return false;
				return !!(
					g.home &&
					g.away &&
					NAME_TO_ABV[g.home] &&
					NAME_TO_ABV[g.away]
				);
			});

		if (!parsed.length)
			throw new Error(
				'No valid games parsed from the feed. Check feed URL or date filters.'
			);

		// Determine Week 1 Monday (UTC)
		let week1MondayUTC;
		if (WEEK1_OVERRIDE) {
			week1MondayUTC = toUtcMonday(WEEK1_OVERRIDE);
			console.log('Using WEEK1 override (Monday):', isoDate(week1MondayUTC));
		} else {
			const earliest = new Date(
				Math.min(...parsed.map((g) => g.date.getTime()))
			);
			week1MondayUTC = mondayOfWeek(earliest);
			console.log(
				'Auto Week1 (Monday of earliest game):',
				isoDate(week1MondayUTC)
			);
		}

		// Data structures:
		// weeklyTotals[team][week] = number
		// dailyLabels[team][week] = array(7) with "OPP" or "@OPP" or 0
		const teamNames = Object.keys(NAME_TO_ABV);
		const weeklyTotals = Object.fromEntries(teamNames.map((n) => [n, []]));
		const dailyLabels = Object.fromEntries(
			teamNames.map((n) => [n, Object.create(null)])
		);

		let maxWeekIndex = 0;

		for (const g of parsed) {
			const wIdx = weekIndexFrom(g.date, week1MondayUTC);
			if (wIdx < 0) continue; // before week1
			maxWeekIndex = Math.max(maxWeekIndex, wIdx);
			const dIdx = mondayZeroDayIndex(g.date); // 0..6 (Mon..Sun)

			// Home team POV
			addGameForTeam({
				team: g.home,
				opponent: g.away,
				away: false,
				wIdx,
				dIdx,
				weeklyTotals,
				dailyLabels
			});

			// Away team POV
			addGameForTeam({
				team: g.away,
				opponent: g.home,
				away: true,
				wIdx,
				dIdx,
				weeklyTotals,
				dailyLabels
			});
		}

		// Decide weeks to emit (pad to WEEKS_TARGET if given)
		const weeks = WEEKS_TARGET || maxWeekIndex + 1;

		const out = teamNames
			.map((name) => {
				const abv = NAME_TO_ABV[name];

				// Weekly totals
				const weekly_games = Array.from({ length: weeks }, (_, i) =>
					Number(weeklyTotals[name]?.[i] || 0)
				);

				// Week_1..Week_N as 7-length arrays with strings or 0
				const extras = {};
				for (let i = 0; i < weeks; i++) {
					const arr = dailyLabels[name][i] || Array(7).fill(0);
					const norm7 = Array.from({ length: 7 }, (_, d) => arr[d] ?? 0);
					extras[`week_${i + 1}`] = norm7;
				}

				return { team: name, team_abv: abv, weekly_games, ...extras };
			})
			.sort((a, b) => a.team.localeCompare(b.team));

		await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
		await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2));
		console.log(
			`Wrote ${out.length} teams × ${weeks} weeks (+ labeled daily arrays) → ${OUT_FILE}`
		);

		const sample = out.find((t) => t.team_abv === 'DEN') || out[0];
		if (sample) {
			console.log(
				'Sample:',
				sample.team_abv,
				'W1:',
				sample.week_1,
				'weekly:',
				sample.weekly_games.slice(0, 3)
			);
		}
	} catch (err) {
		console.error('ERROR:', err.message);
		process.exitCode = 1;
	}
})();

// --------- HELPERS ---------
function getFlag(name) {
	const key = `--${name}=`;
	const arg = process.argv.find((a) => a.startsWith(key));
	return arg ? arg.slice(key.length) : '';
}

function getJSON(url) {
	if (typeof fetch === 'function') {
		return fetch(url).then((r) => {
			if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
			return r.json();
		});
	}
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = '';
				res.on('data', (c) => (data += c));
				res.on('end', () => {
					try {
						resolve(JSON.parse(data));
					} catch (e) {
						reject(e);
					}
				});
			})
			.on('error', reject);
	});
}

function normalizeGame(row) {
	const rawDate = row.DateUtc || row.Date || row.DateUTC || '';
	const homeRaw = row.HomeTeam || row.Home || row.homeTeam || '';
	const awayRaw = row.AwayTeam || row.Away || row.awayTeam || '';

	const date = toUtcDate(rawDate);
	if (!date) return null;

	const home = normalizeTeamName(String(homeRaw).trim());
	const away = normalizeTeamName(String(awayRaw).trim());
	if (!home || !away) return null;

	return { date, home, away };
}

function normalizeTeamName(s) {
	if (!s) return '';
	if (NAME_TO_ABV[s]) return s; // exact full name
	if (ABV_TO_NAME[s.toUpperCase()]) return ABV_TO_NAME[s.toUpperCase()];
	if (ALIAS_TO_NAME[s]) return ALIAS_TO_NAME[s];
	// Try suffix (e.g., "Clippers")
	const bySuffix = Object.keys(NAME_TO_ABV).find((full) =>
		full.endsWith(getLastWord(s))
	);
	if (bySuffix) return bySuffix;
	return '';
}
function getLastWord(str) {
	const parts = str.split(/\s+/).filter(Boolean);
	return parts.length ? parts[parts.length - 1] : str;
}

function toUtcDate(s) {
	if (!s) return null;
	let clean = String(s).trim();
	clean = clean.replace(' UTC', 'Z').replace(' ', 'T'); // "YYYY-MM-DDTHH:mm:ssZ"
	const d = new Date(clean);
	return isNaN(d) ? null : d;
}

function mondayOfWeek(d) {
	const midnight = new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
	);
	const day = midnight.getUTCDay(); // 0 Sun .. 6 Sat
	const diffToMonday = (day + 6) % 7; // Mon=0
	return new Date(midnight.getTime() - diffToMonday * 86400000);
}
function toUtcMonday(ymd) {
	const [y, m, dd] = ymd.split('-').map(Number);
	const d = new Date(Date.UTC(y, m - 1, dd));
	return mondayOfWeek(d);
}
function toUtcMidnight(ymd) {
	const [y, m, dd] = ymd.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, dd));
}
function toUtcEndOfDay(ymd) {
	const [y, m, dd] = ymd.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, dd, 23, 59, 59, 999));
}
function weekIndexFrom(dUTC, week1MondayUTC) {
	const msPerDay = 86400000;
	const dOnly = Date.UTC(
		dUTC.getUTCFullYear(),
		dUTC.getUTCMonth(),
		dUTC.getUTCDate()
	);
	const base = Date.UTC(
		week1MondayUTC.getUTCFullYear(),
		week1MondayUTC.getUTCMonth(),
		week1MondayUTC.getUTCDate()
	);
	const diffDays = Math.floor((dOnly - base) / msPerDay);
	return Math.floor(diffDays / 7); // 0-based
}
function mondayZeroDayIndex(dUTC) {
	// Mon=0 .. Sun=6
	return (dUTC.getUTCDay() + 6) % 7;
}

function addGameForTeam({
	team,
	opponent,
	away,
	wIdx,
	dIdx,
	weeklyTotals,
	dailyLabels
}) {
	// bump weekly total
	if (!weeklyTotals[team]) weeklyTotals[team] = [];
	weeklyTotals[team][wIdx] = (weeklyTotals[team][wIdx] || 0) + 1;

	// label for the day
	if (!dailyLabels[team][wIdx]) dailyLabels[team][wIdx] = Array(7).fill(0);
	const oppAbv = NAME_TO_ABV[opponent];
	const label = away ? `@${oppAbv}` : `${oppAbv}`;

	// If already filled (extremely rare), append with comma
	const prev = dailyLabels[team][wIdx][dIdx];
	dailyLabels[team][wIdx][dIdx] =
		prev && prev !== 0 ? `${prev},${label}` : label;
}

function isoDate(d) {
	return d.toISOString().slice(0, 10);
}
