'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  //直接跳过这个页面，转到explore
  // useEffect(() =>{
  //   router.replace("/explore")
    
  // }, [])
  // return null

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 text-center">
      <h1 className="text-3xl font-bold">
        Welcome to Notion Lite 📝
      </h1>
      <p className="text-gray-500 text-lg mt-2 max-w-md">
        A lightweight and structured note-taking app designed for simplicity, focus, and mobile use.
      </p>
      <div className="mt-6">
        <Button
          className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:brightness-110 transition-all"
          onClick={() => router.push('/explore')}
        >
          Start Exploring
        </Button>
      </div>

    </main>
  )
}