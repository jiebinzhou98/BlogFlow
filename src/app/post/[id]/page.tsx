//  app/post/[id]/page.tsx

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PostDetailPage({params}: {params: {id: string}}){

    const {data: post, error} = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()
    
    if(error || !post){
        notFound()
    }

    return(
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            {post.cover_url &&(
                <Image
                    src={post.cover_url}
                    alt={post.title}
                    width={800}
                    height={400}
                    className="rounded-xl object-cover w-full"
                />
            )}
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</p>
            <article
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{__html: post.content}}
            />
        </main>
    )
}