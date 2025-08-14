import { redirect } from 'next/navigation';

export default function MainPage() {
  // By default, redirect to the chat page when accessing the main part of the app.
  return redirect('/chat');
}
