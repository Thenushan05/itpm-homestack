"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/signin");
  }, []); // Ensures it runs only once when the component mounts

  return <div></div>;
}

export default Page;
