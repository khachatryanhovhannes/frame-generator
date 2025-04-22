// app/page.tsx

"use client";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-6 px-4 text-center bg-white">
      <h1 className="text-3xl font-bold mb-8">Frame Generator</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        <Image
          src="/images/example1.png"
          alt="Example Frame 1"
          width={200}
          height={200}
          className="rounded-xl"
        />
        <Image
          src="/images/example2.png"
          alt="Example Frame 2"
          width={200}
          height={200}
          className="rounded-xl"
        />
        <Image
          src="/images/example3.png"
          alt="Example Frame 3"
          width={200}
          height={200}
          className="rounded-xl"
        />
        <Image
          src="/images/example4.png"
          alt="Example Frame 3"
          width={200}
          height={200}
          className="rounded-xlw"
        />
        <Image
          src="/images/example5.png"
          alt="Example Frame 3"
          width={200}
          height={200}
          className="rounded-xl"
        />
      </div>

      <div className="bg-gray-100 p-6 rounded-xl max-w-xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">🚀 Coming Soon</h2>
        <p className="mb-4">
          A better, more powerful version of Frame Generator is on its way.
        </p>
        <p className="mb-4">
          But if you&apos;re in a hurry, you can still try the old version below
          👇
        </p>
        <Link
          href="https://in-frame-generator.netlify.app/"
          className="inline-block bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
          target="_blank"
        >
          Try the Old Version
        </Link>
      </div>
    </main>
  );
}
