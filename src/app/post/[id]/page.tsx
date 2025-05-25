'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  title: string
  content: string
  cover_url: string
  created_at: string
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/dashboard') 
      } else {
        setPost(data)
      }

      setLoading(false)
    }

    fetchPost()
  }, [params.id, router])

  if (loading) return <div className="p-6 text-center">Loading post...</div>
  if (!post) return null

  const handleDelete = async() =>{
    const confirmed = confirm('Are you are you want to delete this post?')
    if(!confirmed) return

    const {error} = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
    
    if(error) {
        alert('❌ Failed to delete post')
        console.error(error)
    }else{
        alert('✅ Post deleted!')
        router.push('/dashboard')
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {post.cover_url && (
        <Image
          src={post.cover_url}
          alt={post.title}
          width={800}
          height={400}
          className="rounded-xl object-cover w-full"
        />
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className='flex gap-2'>
        <Button onClick={() => router.push(`/post/${post.id}/edit`)}>
          ✏️ Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
            🗑️ Delete
        </Button>
        </div>

      </div>

      <p className="text-gray-500 text-sm">
        {new Date(post.created_at).toLocaleString()}
      </p>

      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <Button variant={"outline"} onClick={() => router.push('/dashboard')}>🔙 Back</Button>
    </main>
  )
}
