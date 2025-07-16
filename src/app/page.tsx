import { redirect } from 'next/navigation';

// This page redirects to the default locale's login page.
export default function RootPage() {
  redirect('/es/login');
}
