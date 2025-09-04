/* eslint-disable no-console */
// scripts/build-weekly-team-games.cjs
// Usage:
//   node scripts/build-weekly-team-games.cjs
//   node scripts/build-weekly-team-games.cjs --feed=https://fixturedownload.com/feed/json/nba-2025 --weeks=23
//   node scripts/build-weekly-team-games.cjs --week1=2025-10-20 --start=2025-10-20 --end=2026-04-15
//
// ENV overrides:
//   FEED=... WEEKS=23 WEEK1=YYYY-MM-DD START=YYYY-MM-DD END=YYYY-MM-DD
//
// Output:
//   ./public/data/nba_2025_weekly_games.json
//
// Notes:
// - W1 (index 0) is the Monday of the first week (auto-detected unless --week1/WEEK1 is given).
// - Weeks are Monday→Sunday.
// - Only games whose teams map to an NBA team are counted.

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
const RANGE_START = process.env.START || getFlag('start') || ''; // optional YYYY-MM-DD (inclusive)
const RANGE_END = process.env.END || getFlag('end') || ''; // optional YYYY-MM-DD (inclusive)

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

// Common aliases → Full name (feed variability)
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
	'Oklahoma City Thunder (IST)': 'Oklahoma City Thunder' // safety
};

const ABV_TO_NAME = Object.fromEntries(
	Object.entries(NAME_TO_ABV).map(([n, a]) => [a, n])
);

// --------- MAIN ---------
(async function main() {
	try {
		console.log('Fetching feed:', FEED_DEFAULT);
		const games = await getJSON(FEED_DEFAULT);

		// Expected feed fields (FixtureDownload JSON):
		// { "DateUtc":"2025-10-22 23:00:00 UTC", "HomeTeam":"Denver Nuggets", "AwayTeam":"Phoenix Suns", ... }
		const parsed = games
			.map(normalizeGame)
			.filter(Boolean)
			.filter((g) => {
				if (RANGE_START && g.date < toUtcMidnight(RANGE_START)) return false;
				if (RANGE_END && g.date > toUtcEndOfDay(RANGE_END)) return false;
				// Only count games where both teams are recognized NBA teams:
				return !!(
					g.home &&
					g.away &&
					NAME_TO_ABV[g.home] &&
					NAME_TO_ABV[g.away]
				);
			});

		if (!parsed.length) {
			throw new Error(
				'No valid games parsed from the feed. Check feed URL or date filters.'
			);
		}

		// Determine week1 Monday (UTC)
		let week1MondayUTC;
		if (WEEK1_OVERRIDE) {
			week1MondayUTC = toUtcMonday(WEEK1_OVERRIDE);
			console.log(
				'Using WEEK1 override (Monday):',
				week1MondayUTC.toISOString().slice(0, 10)
			);
		} else {
			const earliest = new Date(
				Math.min(...parsed.map((g) => g.date.getTime()))
			);
			week1MondayUTC = mondayOfWeek(earliest); // Monday of earliest game
			console.log(
				'Auto Week1 (Monday of earliest game):',
				week1MondayUTC.toISOString().slice(0, 10)
			);
		}

		// Build team-week counts
		const teamKeys = Object.keys(NAME_TO_ABV);
		const counts = Object.fromEntries(teamKeys.map((name) => [name, []])); // arrays of totals

		let maxWeekIndex = 0;
		for (const g of parsed) {
			const wIdx = weekIndexFrom(g.date, week1MondayUTC);
			if (wIdx < 0) continue; // before week1
			maxWeekIndex = Math.max(maxWeekIndex, wIdx);
			// bump for both teams
			bump(counts, g.home, wIdx);
			bump(counts, g.away, wIdx);
		}

		const weeks = Math.min(WEEKS_TARGET || maxWeekIndex + 1, maxWeekIndex + 1);

		// Produce final array
		const out = teamKeys
			.map((name) => {
				const abv = NAME_TO_ABV[name];
				const arr = counts[name] || [];
				// normalize length to `weeks` with zeros
				const weekly = Array.from({ length: weeks }, (_, i) =>
					Number(arr[i] || 0)
				);
				return { team: name, team_abv: abv, weekly_games: weekly };
			})
			// Only keep teams that actually appear in the feed window (optional; comment out if you want all teams)
			// .filter(row => row.weekly_games.some(v => v > 0))
			.sort((a, b) => a.team.localeCompare(b.team));

		await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
		await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2));
		console.log(`Wrote ${out.length} teams × ${weeks} weeks → ${OUT_FILE}`);

		// Quick sanity print
		const sample = out.find((t) => t.team_abv === 'DEN') || out[0];
		if (sample) {
			console.log(
				'Sample:',
				sample.team_abv,
				sample.weekly_games.slice(0, 6),
				'...'
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
	// Fallback for older Node
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

// Normalize one game row from the feed
function normalizeGame(row) {
	// Common FixtureDownload fields
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
	// If already an exact full-name key
	if (NAME_TO_ABV[s]) return s;

	// Abbreviation?
	if (ABV_TO_NAME[s.toUpperCase()]) return ABV_TO_NAME[s.toUpperCase()];

	// Alias mapping
	if (ALIAS_TO_NAME[s]) return ALIAS_TO_NAME[s];

	// Heuristic: some feeds give city only — try alias map
	const alias = ALIAS_TO_NAME[s] || '';
	if (alias) return alias;

	// As a last resort, try to match by suffix (e.g., "Clippers")
	const bySuffix = Object.keys(NAME_TO_ABV).find((full) =>
		full.endsWith(getLastWord(s))
	);
	if (bySuffix) return bySuffix;

	// Unknown team; return empty to filter out
	return '';
}

function getLastWord(str) {
	const parts = str.split(/\s+/).filter(Boolean);
	return parts.length ? parts[parts.length - 1] : str;
}

// "2025-10-22 23:00:00 UTC" → Date
function toUtcDate(s) {
	if (!s) return null;
	let clean = String(s).trim();
	clean = clean.replace(' UTC', 'Z').replace(' ', 'T'); // "YYYY-MM-DDTHH:mm:ssZ"
	const d = new Date(clean);
	return isNaN(d) ? null : d;
}

// Monday of the week (UTC) for a given Date
function mondayOfWeek(d) {
	const midnight = new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
	);
	const day = midnight.getUTCDay(); // 0 Sun, 1 Mon, ..., 6 Sat
	const diffToMonday = (day + 6) % 7; // 0 if Mon, 1 if Tue, ... 6 if Sun
	return new Date(midnight.getTime() - diffToMonday * 86400000);
}

// Parse YYYY-MM-DD to Monday UTC (if not Monday, go back to its Monday)
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

function bump(counts, teamFullName, wIdx) {
	if (!NAME_TO_ABV[teamFullName]) return;
	const arr = counts[teamFullName] || (counts[teamFullName] = []);
	arr[wIdx] = (arr[wIdx] || 0) + 1;
}
