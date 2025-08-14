import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the affiliation code check page.
  return redirect('/affiliate-code');
}
