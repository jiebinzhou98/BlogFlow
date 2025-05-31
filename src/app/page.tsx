'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 text-center">
      <h1 className="text-3xl font-bold">
        Welcome to Foodie Picks 🍽️
        <p className="text-gray-500 text-lg mt-2">
          Discover delicious restaurants shared by others, or log in to recommend your favorite spots!
        </p>
        <div className="mt-6">
          <Button
            className="bg-gradient-to-r from-green-500 to-lime-500 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:brightness-110 transition-all"
            onClick={() => router.push('/explore')}
          >
            Explore Restaurants
          </Button>
        </div>
      </h1>
    </main>
  )
}