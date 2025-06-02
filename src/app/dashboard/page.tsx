'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Profile {
  username: string
  bio: string
  avatar_url: string
  is_guest: boolean
}

interface Post {
  id: string
  title: string
  content: string
  cover_url: string
  created_at: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([])
  const [draftPosts, setDraftPosts] = useState<Post[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      setEmail(user.email!)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData || null)

      const { data: published } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (published) setPublishedPosts(published)

      const { data: drafts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .is('published', false)
        .order('created_at', { ascending: false })
      if (drafts) setDraftPosts(drafts)

      setLoading(false)
    }

    fetchUserProfile()
  }, [router])

  const handlePublish = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ published: true })
      .eq('id', postId)

    if (error) {
      alert('❌ Failed to publish draft')
      console.error(error)
    } else {
      alert('✅ Draft published!')
      const publishedPost = draftPosts.find((post) => post.id === postId)
      if (publishedPost) {
        setDraftPosts(draftPosts.filter((post) => post.id !== postId))
        setPublishedPosts([publishedPost, ...publishedPosts])
      }
    }
  }

  if (loading) return <div className="p-4 text-center">Loading...</div>

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      {/* Published Posts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">📢 Published Posts</h2>
        {publishedPosts.length === 0 ? (
          <p className="text-gray-500">No published posts yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {publishedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-200 hover:scale-[1.01] cursor-pointer flex flex-col h-64"
              >
                {post.cover_url && (
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    width={500}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.content.replace(/<[^>]+>/g, '').slice(0, 100)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drafts */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-6">📝 Drafts</h3>
        {draftPosts.length === 0 ? (
          <p className="text-gray-500">No drafts saved yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {draftPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-100 flex flex-col h-64"
              >
                {post.cover_url && (
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    width={500}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.content.replace(/<[^>]+>/g, '').slice(0, 100)}...
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm w-full"
                      onClick={() => router.push(`/post/${post.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-sm"
                      onClick={() => handlePublish(post.id)}
                    >
                      📤 Publish
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
