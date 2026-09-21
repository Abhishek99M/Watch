import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6 py-20">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-6 text-stone-300">We could not find the page you requested.</p>
      <Link className="mt-8 w-fit underline underline-offset-4" href="/">Return home</Link>
    </main>
  );
}
