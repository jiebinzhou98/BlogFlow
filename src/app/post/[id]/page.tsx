// 'use client'

// import { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabase'
// import { useRouter, useParams } from 'next/navigation'
// import Image from 'next/image'
// import { Button } from '@/components/ui/button'
// import { Star, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
// import MapView from '@/components/MapView'
// import { useJsApiLoader } from '@react-google-maps/api'

// interface Post {
//     id: string
//     title: string
//     content: string
//     cover_url: string
//     created_at: string
//     author_id: string
//     latitude: number
//     longitude: number
//     address?: string
//     initial_rating: number
// }

// export default function PostDetailPage() {
//     const router = useRouter()
//     const [post, setPost] = useState<Post | null>(null)
//     const [loading, setLoading] = useState(true)
//     const [userId, setUserId] = useState<string | null>(null)
//     const [averageRating, setAverageRating] = useState<number | null>(null)
//     const [userRating, setUserRating] = useState<number | null>(null)
//     const [backPath, setBackPath] = useState('/explore')
//     const [submitting, setSubmitting] = useState(false)
//     const params = useParams()
//     const postId = params.id as string
//     const isAuthor = userId === post?.author_id
//     const [showMap, setShowMap] = useState(false)

//     const { isLoaded } = useJsApiLoader({
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//         libraries: ['places'],
//     })

//     useEffect(() => {
//         const fetchPostAndRatings = async () => {
//             const { data: postData, error } = await supabase
//                 .from('posts')
//                 .select('*')
//                 .eq('id', postId)
//                 .single()

//             if (error || !postData) {
//                 router.push('/dashboard')
//             } else {
//                 setPost(postData)
//             }

//             const { data: userData } = await supabase.auth.getUser()
//             const uid = userData?.user?.id || null
//             setUserId(uid)

//             if (uid) {
//                 setBackPath('/dashboard')
//                 const { data: userRatingData } = await supabase
//                     .from('ratings')
//                     .select('rating')
//                     .eq('user_id', uid)
//                     .eq('post_id', postId)
//                     .single()
//                 setUserRating(userRatingData?.rating ?? null)
//             }

//             const { data: allRatings } = await supabase
//                 .from('ratings')
//                 .select('rating')
//                 .eq('post_id', postId)

//             if (allRatings && allRatings.length > 0) {
//                 const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
//                 setAverageRating(avg)
//             } else if (postData.initial_rating > 0) {
//                 setAverageRating(postData.initial_rating)
//             }


//             setLoading(false)
//         }
//         fetchPostAndRatings()
//     }, [postId, router])

//     const handleDelete = async () => {
//         const confirmed = confirm('Are you are you want to delete this post?')
//         if (!confirmed) return

//         const filePath = post?.cover_url?.split('/').pop()

//         if (filePath) {
//             const { error: storageError } = await supabase
//                 .storage
//                 .from('covers')
//                 .remove([filePath])

//             if (storageError) {
//                 console.warn('⚠️ Failed to delete cover image:', storageError.message)
//             }
//         }

//         const { error } = await supabase
//             .from('posts')
//             .delete()
//             .eq('id', post?.id)

//         if (error) {
//             alert('❌ Failed to delete post')
//             console.error(error)
//         } else {
//             alert('✅ Post deleted!')
//             router.push('/dashboard')
//         }
//     }

//     const submitRating = async (rating: number) => {
//         if (!userId || !postId) return
//         setSubmitting(true)

//         const { data: existing } = await supabase
//             .from('ratings')
//             .select('*')
//             .eq('user_id', userId)
//             .eq('post_id', postId)
//             .single()

//         let error = null
//         if (existing) {
//             ; ({ error } = await supabase
//                 .from('ratings')
//                 .update({ rating })
//                 .eq('id', existing.id))
//         } else {
//             ; ({ error } = await supabase.from('ratings').insert({ user_id: userId, post_id: postId, rating }))
//         }

//         if (error) {
//             alert('❌ Failed to submit rating')
//             console.error(error)
//         } else {
//             setUserRating(rating)
//             alert('✅ Rating submitted!')
//         }
//         setSubmitting(false)
//     }

//     if (loading) return <div className="p-6 text-center">Loading post...</div>
//     if (!post) return null

//     return (
//         <main className="max-w-3xl mx-auto p-6 space-y-6">
//             {post.cover_url && (
//                 <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow">
//                     <Image
//                         src={post.cover_url}
//                         alt={post.title}
//                         width={800}
//                         height={400}
//                         className="w-full h-60 object-cover"
//                     />
//                 </div>
//             )}

//             <div className="flex justify-between items-center">
//                 <h1 className="text-3xl font-bold">{post.title}</h1>
//                 {isAuthor && (
//                     <div className='flex gap-2'>
//                         <Button onClick={() => router.push(`/post/${post.id}/edit`)}>
//                             ✏️ Edit
//                         </Button>
//                         <Button variant="destructive" onClick={handleDelete}>
//                             🗑️ Delete
//                         </Button>
//                     </div>
//                 )}
//             </div>

//             <p className="text-gray-500 text-sm">
//                 {new Date(post.created_at).toLocaleString()}
//             </p>

//             {averageRating && (
//                 <div className="flex items-center gap-1 text-yellow-600 text-sm">
//                     {[1, 2, 3, 4, 5].map((i) => (
//                         <Star
//                             key={i}
//                             className={`w-5 h-5 ${i <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
//                             fill={i <= Math.round(averageRating) ? 'currentColor' : 'none'}
//                             stroke="currentColor"
//                         />
//                     ))}
//                     <span className="text-gray-600 ml-1">({averageRating.toFixed(1)} / 5)</span>
//                 </div>
//             )}

//             {post.latitude && post.longitude && (
//                 <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
//                     {/* 地址行 */}
//                     <div className="flex items-start gap-2 text-sm text-gray-700">
//                         <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
//                         <div>
//                             <p className="font-medium">Location:</p>
//                             <p className="text-gray-600">
//                                 {post.address || `(${post.latitude.toFixed(5)}, ${post.longitude.toFixed(5)})`}
//                             </p>
//                         </div>
//                     </div>

//                     {/* 显示/隐藏地图按钮 */}
//                     <button
//                         onClick={() => setShowMap((prev) => !prev)}
//                         className="flex items-center text-sm text-blue-600 hover:underline mt-1"
//                     >
//                         {showMap ? 'Hide Map' : 'Show on Map'}
//                         {showMap ? (
//                             <ChevronUp className="w-4 h-4 ml-1" />
//                         ) : (
//                             <ChevronDown className="w-4 h-4 ml-1" />
//                         )}
//                     </button>

//                     {/* 地图区域（可展开） */}
//                     {showMap && isLoaded && (
//                         <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border mt-2">
//                             <MapView latitude={post.latitude} longitude={post.longitude} />
//                         </div>
//                     )}
//                 </div>
//             )}

//             <article
//                 className="prose prose-lg max-w-none"
//                 dangerouslySetInnerHTML={{ __html: post.content }}
//             />

//             <Button variant="outline" onClick={() => router.push(backPath)}>
//                 🔙 Back
//             </Button>
//         </main>
//     )
// }
