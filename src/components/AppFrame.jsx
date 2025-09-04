'use client';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default function AppFrame({ children }) {
	const pathname = usePathname() || '/';
	return <AppShell currentPath={pathname}>{children}</AppShell>;
}
