'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  cover_url: string
  created_at: string
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setPosts(data)
      }
      setLoading(false)
    }
    fetchPost()
  }, [])

  if (loading) return <div className="p-4 text-center">Loading posts...</div>

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <h1 className="text-3xl font-bold text-center">🌍 Explore Public Posts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ➕ Create new post card */}
        <div
          onClick={() => router.push("/create")}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition h-60"
        >
          <Plus className="w-8 h-8 text-gray-500 mb-2" />
          <p className="text-gray-600 font-medium">Create New Post</p>
        </div>

        {/* 📄 Existing posts */}
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition flex flex-col h-full"
          >
            {post.cover_url && (
              <Image
                src={post.cover_url}
                alt={post.title}
                width={500}
                height={300}
                className="w-full h-60 object-cover"
              />
            )}
            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3">
                  {(() => {
                    const plainText = post.content.replace(/<[^>]+>/g, "")
                    return plainText.length > 150
                      ? plainText.slice(0, 150) + "..."
                      : plainText
                  })()}
                </p>
              </div>
              <div className="mt-4">
                <button
                  className="w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 transition"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  Read More →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
