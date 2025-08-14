import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the login page.
  return redirect('/login');
}
