'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import MapView from '@/components/MapView'

interface Post {
    id: string
    title: string
    content: string
    cover_url: string
    created_at: string
    author_id: string
    latitude: number
    longitude: number
}

export default function PostDetailPage() {
    const router = useRouter()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [averageRating, setAverageRating] = useState<number | null>(null)
    const [userRating, setUserRating] = useState<number | null>(null)
    const [backPath, setBackPath] = useState('/explore')
    const [submitting, setSubmitting] = useState(false)
    const params = useParams()
    const postId = params.id as string
    const isAuthor = userId === post?.author_id

    useEffect(() => {
        const fetchPostAndRatings = async () => {
            const { data: postData, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single()

            if (error || !postData) {
                router.push('/dashboard')
            } else {
                setPost(postData)
            }

            const { data: userData } = await supabase.auth.getUser()
            const uid = userData?.user?.id || null
            setUserId(uid)

            if (uid) {
                setBackPath('/dashboard')
                const { data: userRatingData } = await supabase
                    .from('ratings')
                    .select('rating')
                    .eq('user_id', uid)
                    .eq('post_id', postId)
                    .single()
                setUserRating(userRatingData?.rating ?? null)
            }

            const { data: allRatings } = await supabase
                .from('ratings')
                .select('rating')
                .eq('post_id', postId)

            if (allRatings && allRatings.length > 0) {
                const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
                setAverageRating(avg)
            }

            setLoading(false)
        }
        fetchPostAndRatings()
    }, [postId, router])

    const handleDelete = async () => {
        const confirmed = confirm('Are you are you want to delete this post?')
        if (!confirmed) return

        const filePath = post?.cover_url?.split('/').pop()

        if (filePath) {
            const { error: storageError } = await supabase
                .storage
                .from('covers')
                .remove([filePath])

            if (storageError) {
                console.warn('⚠️ Failed to delete cover image:', storageError.message)
            }
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', post?.id)

        if (error) {
            alert('❌ Failed to delete post')
            console.error(error)
        } else {
            alert('✅ Post deleted!')
            router.push('/dashboard')
        }
    }

    const submitRating = async (rating: number) => {
        if (!userId || !postId) return
        setSubmitting(true)

        const { data: existing } = await supabase
            .from('ratings')
            .select('*')
            .eq('user_id', userId)
            .eq('post_id', postId)
            .single()

        let error = null
        if (existing) {
            ; ({ error } = await supabase
                .from('ratings')
                .update({ rating })
                .eq('id', existing.id))
        } else {
            ; ({ error } = await supabase.from('ratings').insert({ user_id: userId, post_id: postId, rating }))
        }

        if (error) {
            alert('❌ Failed to submit rating')
            console.error(error)
        } else {
            setUserRating(rating)
            alert('✅ Rating submitted!')
        }
        setSubmitting(false)
    }

    if (loading) return <div className="p-6 text-center">Loading post...</div>
    if (!post) return null

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            {post.cover_url && (
                <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow">
                    <Image
                        src={post.cover_url}
                        alt={post.title}
                        width={800}
                        height={400}
                        className="w-full h-60 object-cover"
                    />
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{post.title}</h1>
                {isAuthor && (
                    <div className='flex gap-2'>
                        <Button onClick={() => router.push(`/post/${post.id}/edit`)}>
                            ✏️ Edit
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            🗑️ Delete
                        </Button>
                    </div>
                )}
            </div>

            <p className="text-gray-500 text-sm">
                {new Date(post.created_at).toLocaleString()}
            </p>

            {averageRating && (
                <p className="text-sm text-yellow-600">⭐ Average Rating: {averageRating.toFixed(1)} / 5</p>
            )}

            {userId && (
                <div className="space-y-2">
                    <p className="font-medium">Your Rating:</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => submitRating(star)}
                                disabled={submitting}
                                className={`text-yellow-500 hover:scale-110 transition-transform ${userRating && star <= userRating ? '' : 'opacity-40'}`}
                            >
                                <Star fill="currentColor" stroke="currentColor" className="w-6 h-6" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {post.latitude && post.longitude && (
                <MapView latitude={post.latitude} longitude={post.longitude} />
            )}

            <article
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Button variant="outline" onClick={() => router.push(backPath)}>
                🔙 Back
            </Button>
        </main>
    )
}