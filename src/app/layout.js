export const metadata = {
	title: 'FantasyEdge',
	description: 'Dominate your fantasy basketball league'
};

import AppFrame from '@/components/AppFrame';

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body style={{ margin: 0 }}>
				<AppFrame>{children}</AppFrame>
			</body>
		</html>
	);
}
