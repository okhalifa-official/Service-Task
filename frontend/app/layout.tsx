import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Course Platform',
  description: 'Next.js frontend for the user and course services',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en"><body>
      <header className="topbar"><Link href="/" className="brand">Course <span>Platform</span></Link>
        <nav><Link href="/login">Login</Link><Link href="/courses">Courses</Link><Link href="/users">Users</Link></nav>
      </header>
      <main className="container">{children}</main>
      <footer>Next.js :3002 → API Gateway :4000 → user-service :3000 · course-service :3001</footer>
    </body></html>
  );
}
