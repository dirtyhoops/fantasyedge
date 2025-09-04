'use client';
import React, { useEffect, useState, useRef } from 'react';

/**
 * AppShell + Navbar with Schedule dropdown
 * - Desktop: "Schedule" shows a dropdown (trigger is a link with no underline/outline)
 * - Mobile: "Schedule" shows nested links inside the drawer
 * - Active state highlights Schedule on any /schedule/* route
 */

const navItems = [
	{ href: '/draft', label: 'Draft' },
	{ href: '/optimizer', label: 'Optimizer' },
	{
		label: 'Schedule',
		href: '/schedule',
		children: [
			{ href: '/schedule/nba', label: 'NBA Schedule' },
			{ href: '/schedule/weekly', label: 'NBA Weekly Schedule' },
			{ href: '/schedule/playoffs', label: 'Playoff Schedule' }
		]
	},
	{ href: '/matchups', label: 'Matchups' },
	{ href: '/waivers', label: 'Waivers' },
	{ href: '/trends', label: 'Trends' },
	{ href: '/trade', label: 'Trade' },
	{ href: '/news', label: 'News' }
	// { href: '/news', label: 'News', badge: 'New' }
];

function useTheme() {
	const [theme, setTheme] = useState('light');
	useEffect(() => {
		const saved =
			typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
		if (saved === 'dark' || saved === 'light') {
			setTheme(saved);
			document.documentElement.setAttribute('data-theme', saved);
		}
	}, []);
	const toggle = () => {
		const next = theme === 'light' ? 'dark' : 'light';
		setTheme(next);
		document.documentElement.setAttribute('data-theme', next);
		localStorage.setItem('theme', next);
	};
	return { theme, toggle };
}

function Container({ style, children }) {
	return (
		<div
			style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', ...style }}
		>
			{children}
		</div>
	);
}

function IconTrophy(props) {
	return (
		<svg
			viewBox='0 0 24 24'
			width={18}
			height={18}
			aria-hidden='true'
			{...props}
		>
			<g
				fill='none'
				stroke='currentColor'
				strokeWidth='1.6'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M7 6h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V6z' />
				<path d='M7 8H5a3 3 0 0 0 3 3' />
				<path d='M17 8h2a3 3 0 0 1-3 3' />
				<path d='M12 13v3m-4 3h8M9 19h6' />
			</g>
		</svg>
	);
}
function IconMenu(props) {
	return (
		<svg
			viewBox='0 0 24 24'
			width={20}
			height={20}
			aria-hidden='true'
			{...props}
		>
			<path
				d='M3 6h18M3 12h18M3 18h18'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
			/>
		</svg>
	);
}
function IconSun(props) {
	return (
		<svg
			viewBox='0 0 24 24'
			width={16}
			height={16}
			aria-hidden='true'
			{...props}
		>
			<circle cx='12' cy='12' r='4' fill='currentColor' />
			<g stroke='currentColor' strokeWidth='1.5'>
				<path d='M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1' />
			</g>
		</svg>
	);
}
function IconMoon(props) {
	return (
		<svg
			viewBox='0 0 24 24'
			width={16}
			height={16}
			aria-hidden='true'
			{...props}
		>
			<path
				d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z'
				fill='currentColor'
			/>
		</svg>
	);
}
function IconChevron(props) {
	return (
		<svg
			viewBox='0 0 24 24'
			width={14}
			height={14}
			aria-hidden='true'
			{...props}
		>
			<path
				d='M6 9l6 6 6-6'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
				fill='none'
			/>
		</svg>
	);
}

function ThemeToggle() {
	const { theme, toggle } = useTheme();
	return (
		<button
			className='btn ghost'
			onClick={toggle}
			aria-label='Toggle theme'
			title='Toggle theme'
		>
			{theme === 'light' ? <IconMoon /> : <IconSun />}
		</button>
	);
}

function Badge({ children }) {
	return (
		<span
			style={{
				marginLeft: 8,
				fontSize: 10,
				fontWeight: 700,
				letterSpacing: 0.3,
				padding: '3px 6px',
				borderRadius: 999,
				background: 'var(--accent-weak)',
				color: 'var(--accent-strong)'
			}}
		>
			{children}
		</span>
	);
}

function Logo() {
	return (
		<a href='/' className='logo'>
			<IconTrophy className='logo-icon' />
			<span className='logo-text'>FantasyEdge</span>
		</a>
	);
}

function DesktopNav({ currentPath }) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef(null);

	// Close dropdown on outside click
	useEffect(() => {
		function onDocClick(e) {
			if (!menuRef.current) return;
			if (!menuRef.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	}, []);

	return (
		<nav className='desktop-nav'>
			{navItems.map((item) => {
				const isSchedule = !!item.children;
				const active = isSchedule
					? currentPath === item.href || currentPath.startsWith('/schedule')
					: currentPath === item.href;

				if (!isSchedule) {
					return (
						<a
							key={item.href}
							href={item.href}
							className={active ? 'pill active' : 'pill'}
							aria-current={active ? 'page' : undefined}
						>
							{item.label}
							{item.badge ? <Badge>{item.badge}</Badge> : null}
						</a>
					);
				}

				// Dropdown trigger as <a> (no button look/outline/underline)
				return (
					<div key={item.label} className='menu' ref={menuRef}>
						<a
							href={item.href}
							className={
								active ? 'pill active menu-trigger' : 'pill menu-trigger'
							}
							aria-haspopup='menu'
							aria-expanded={open ? 'true' : 'false'}
							onClick={(e) => {
								e.preventDefault();
								setOpen((v) => !v);
							}}
							onMouseEnter={() => setOpen(true)}
						>
							{item.label}
							<IconChevron className={open ? 'chev open' : 'chev'} />
						</a>
						{open && (
							<div
								className='menu-list'
								role='menu'
								onMouseLeave={() => setOpen(false)}
							>
								{item.children.map((c) => (
									<a
										key={c.href}
										className='menu-item'
										role='menuitem'
										href={c.href}
									>
										{c.label}
									</a>
								))}
							</div>
						)}
					</div>
				);
			})}
		</nav>
	);
}

function MobileNav({ currentPath }) {
	const [open, setOpen] = useState(false);
	const isActive = (href) =>
		href === '/schedule'
			? currentPath.startsWith('/schedule')
			: currentPath === href;

	return (
		<>
			<button
				aria-label='Open menu'
				onClick={() => setOpen(true)}
				className='btn ghost md-hidden'
			>
				<IconMenu />
			</button>

			{open && (
				<div
					role='dialog'
					aria-modal='true'
					className='drawer-mask'
					onClick={() => setOpen(false)}
				>
					<aside onClick={(e) => e.stopPropagation()} className='drawer'>
						<div className='drawer-head'>
							<Logo />
							<button
								className='btn ghost'
								onClick={() => setOpen(false)}
								aria-label='Close'
							>
								✕
							</button>
						</div>
						<div className='drawer-body'>
							{navItems.map((item) => {
								if (!item.children) {
									return (
										<a
											key={item.href}
											href={item.href}
											onClick={() => setOpen(false)}
											className={
												isActive(item.href)
													? 'drawer-link active'
													: 'drawer-link'
											}
										>
											{item.label}
											{item.badge ? <Badge>{item.badge}</Badge> : null}
										</a>
									);
								}
								// Schedule + nested links (simple inline list)
								return (
									<div key='schedule-group' style={{ display: 'grid', gap: 6 }}>
										<a
											href={item.href}
											onClick={() => setOpen(false)}
											className={
												isActive(item.href)
													? 'drawer-link active'
													: 'drawer-link'
											}
										>
											{item.label}
										</a>
										<div style={{ paddingLeft: 16, display: 'grid', gap: 6 }}>
											{item.children.map((c) => (
												<a
													key={c.href}
													href={c.href}
													onClick={() => setOpen(false)}
													className={
														isActive(c.href)
															? 'drawer-link active'
															: 'drawer-link'
													}
													style={{ fontSize: 13, opacity: 0.95 }}
												>
													{c.label}
												</a>
											))}
										</div>
										<div className='divider' />
									</div>
								);
							})}
							<a
								href='/account'
								className='btn ghost'
								style={{ justifyContent: 'flex-start' }}
							>
								Account
							</a>
							<a
								href='/login'
								className='link-cta'
								style={{ justifyContent: 'flex-start' }}
							>
								Sign In<span className='arrow'>→</span>
							</a>
						</div>
					</aside>
				</div>
			)}
		</>
	);
}

function Navbar({ currentPath }) {
	return (
		<header className='header'>
			<div className='header-blur' />
			<Container
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					height: 72
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<MobileNav currentPath={currentPath} />
					<Logo />
				</div>

				<DesktopNav currentPath={currentPath} />

				<div className='desktop-actions'>
					<ThemeToggle />
					<a href='/login' className='link-cta'>
						Sign In<span className='arrow'>→</span>
					</a>
				</div>
			</Container>

			{/* Styles */}
			<style>{`
        :root{
          --bg: #ffffff;
          --card: #ffffff;
          --fg: #0f172a;
          --muted: #6b7280;
          --border: #e5e7eb;
          --shadow: 0 8px 24px rgba(2, 6, 23, 0.08);
          --accent: linear-gradient(135deg,#7c3aed, #2563eb);
          --accent-weak: rgba(124,58,237,0.12);
          --accent-strong: #6d28d9;
        }
        [data-theme="dark"]{
          --bg: #0b1020;
          --card: #0f1528;
          --fg: #e5e7eb;
          --muted: #9ca3af;
          --border: #1f2a44;
          --shadow: 0 8px 24px rgba(0,0,0,0.5);
          --accent: linear-gradient(135deg,#a78bfa, #60a5fa);
          --accent-weak: rgba(167,139,250,0.16);
          --accent-strong: #c4b5fd;
        }

        .header{
          position: sticky; top: 0; z-index: 50; width: 100%;
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border);
          background: color-mix(in oklab, var(--bg) 80%, transparent);
        }
        .header-blur{ position:absolute; inset:0; pointer-events:none; }

        .logo{ display:inline-flex; align-items:center; gap:10px; color:inherit; text-decoration:none; }
        .logo-icon{ width:22px; height:22px; display:inline-block; }
        .logo-text{ font-size:20px; font-weight:800; letter-spacing:-0.01em; }

        .desktop-nav{ display:none; gap:12px; align-items:center; }
        .pill{
          position:relative; display:inline-flex; align-items:center; gap:8px;
          padding:10px 8px; text-decoration:none; border-radius:10px;
          color: var(--muted); transition: color .2s ease;
        }
        .pill:hover{ color: var(--fg); }
        .pill.active{ color: var(--fg); font-weight: 700; }
        .pill.active::after{
          content: ""; position:absolute; left:6px; right:6px; bottom:4px; height:2px;
          border-radius: 2px; background: var(--accent);
          box-shadow: 0 4px 12px rgba(37,99,235,0.35);
        }

        /* Dropdown */
        .menu{ position:relative; }
        .menu-trigger{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; }
        /* Make Schedule trigger look like a plain link (no outline/ink-bar) */
        .menu-trigger:focus, .menu-trigger:focus-visible { outline: none; box-shadow: none; }
        .menu-trigger.pill.active::after { display: none; }

        .menu-list{
          position:absolute; top:100%; left:0; margin-top:8px; min-width: 220px;
          border:1px solid var(--border); border-radius:12px; background: var(--card);
          box-shadow: var(--shadow); padding:8px; display:grid; gap:4px;
        }
        .menu-item{ display:flex; align-items:center; padding:10px 12px; border-radius:10px; text-decoration:none; color: var(--fg); }
        .menu-item:hover{ background: rgba(2,6,23,0.05); }
        .chev { transition: transform .15s ease; }
        .chev.open { transform: rotate(180deg); }

        .desktop-actions{ display:none; align-items:center; gap:10px; }
        .btn{ display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:999px; border:1px solid var(--border); background: var(--card); color: var(--fg); cursor:pointer; text-decoration:none; transition: all .2s; }
        .btn:hover{ transform: translateY(-1px); box-shadow: var(--shadow); }
        .btn.ghost{ background: transparent; }
        .btn.primary{ background: var(--accent); color:#fff; border-color: transparent; box-shadow: 0 6px 20px rgba(37,99,235,0.25); }
        /* Link-style CTA */
        .link-cta{ position:relative; display:inline-flex; align-items:center; gap:6px; padding:6px 0; border:none; background:transparent; color: var(--fg); font-weight: 700; text-decoration: none; }
        .link-cta .arrow{ transition: transform .2s ease; }
        .link-cta::after{ content:""; position:absolute; left:0; right:0; bottom:-2px; height:2px; border-radius:2px; background: var(--accent); transform: scaleX(.18); transform-origin:left; transition: transform .25s ease; }
        .link-cta:hover .arrow{ transform: translateX(3px); }
        .link-cta:hover::after{ transform: scaleX(1); }
        .link-cta:focus-visible{ outline:none; box-shadow: 0 0 0 3px rgba(99,102,241,0.35); border-radius:6px; }

        /* Drawer */
        .drawer-mask{ position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter: blur(2px); }
        .drawer{
          position:absolute; top:0; left:0; width:320px; height:100%;
          background: var(--card);
          -webkit-backdrop-filter: none; backdrop-filter: none;
          border-right:1px solid var(--border); display:flex; flex-direction:column;
          box-shadow: 0 20px 60px rgba(2,6,23,0.35);
          overscroll-behavior: contain; transform: translateZ(0);
        }
        .drawer-head{ display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid var(--border); background: var(--card); }
        .drawer-body{ padding:10px; display:grid; gap:6px; background: var(--card); }
        .drawer-link{ position:relative; display:flex; align-items:center; gap:8px; padding:12px 12px 12px 18px; border-radius:12px; color: var(--fg); text-decoration:none; }
        .drawer-link:hover{ background: rgba(2,6,23,0.05); }
        .drawer-link.active{ background: transparent; color: var(--fg); }
        .drawer-link.active::before{ content:""; position:absolute; left:8px; top:8px; bottom:8px; width:3px; border-radius:3px; background: var(--accent); box-shadow: 0 4px 12px rgba(37,99,235,0.35); }
        .divider{ height:1px; background:var(--border); margin:8px 0; }

        /* Responsive */
        @media (min-width: 960px){
          .md-hidden { display:none !important; }
          .desktop-nav { display:inline-flex !important; }
          .desktop-actions { display:inline-flex !important; }
        }
      `}</style>
		</header>
	);
}

export function AppShell({ children, currentPath = '/' }) {
	return (
		<div
			style={{
				minHeight: '100vh',
				background: 'var(--bg)',
				color: 'var(--fg)'
			}}
		>
			<Navbar currentPath={currentPath} />
			<main style={{ padding: '28px 0' }}>
				<Container>{children}</Container>
			</main>
			<footer
				style={{
					borderTop: '1px solid var(--border)',
					padding: '36px 0',
					fontSize: 14,
					color: 'var(--muted)'
				}}
			>
				<Container
					style={{
						display: 'flex',
						gap: 12,
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'space-between'
					}}
				>
					<p>© {new Date().getFullYear()} FantasyEdge. All rights reserved.</p>
					<nav style={{ display: 'flex', gap: 16 }}>
						<a
							href='/privacy'
							style={{ color: 'inherit', textDecoration: 'none' }}
						>
							Privacy
						</a>
						<a
							href='/terms'
							style={{ color: 'inherit', textDecoration: 'none' }}
						>
							Terms
						</a>
						<a
							href='/contact'
							style={{ color: 'inherit', textDecoration: 'none' }}
						>
							Contact
						</a>
					</nav>
				</Container>
			</footer>
		</div>
	);
}
