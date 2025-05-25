'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

    return(
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to Blog Platform ✍️
          <p className="text-gray-500 text-lg">Explore what others have published or log in to create your own
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:brightness-110 transition-all" 
                onClick={() => router.push('/explore')}>Explore Posts</Button>
          </p>
        </h1>
      </main>
    )
}
