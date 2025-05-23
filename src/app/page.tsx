import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return(
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-3xl font-bold">Welcome to Blog Platform ✍️
          <p className="text-gray-500">A multi-user blog system built with supabase + Next.js
            <div className="flex gap-4 mt-4">
              <Link href="/Login">
              <Button>Login</Button>
              </Link>
              <Link href="/register">
              <Button variant="outline">Register</Button>
              </Link>
            </div>
          </p>
        </h1>
      </main>
    )
}
