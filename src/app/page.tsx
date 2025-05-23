'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

    return(
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-3xl font-bold">Welcome to Blog Platform ✍️
          <p className="text-gray-500">A multi-user blog system built with supabase + Next.js
            <div className="flex gap-4 mt-4">
              <Button onClick={() => router.push('/login')}>Login</Button>
              <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
            </div>
          </p>
        </h1>
      </main>
    )
}
