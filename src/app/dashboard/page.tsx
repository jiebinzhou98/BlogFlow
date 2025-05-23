'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Profile {
    username: string
    bio: string
    avatar_url: string
    is_guest: boolean
}

export default function DashboardPage() {

    const [profile, setProfile] = useState<Profile | null>(null)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUserProfile = async () =>{
            const {
                data: {user},
                error: userError,
            } = await supabase.auth.getUser()

            if(userError || !user){
                router.push('/login')
                return
            }

            setEmail(user.email!)

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if(error){
                console.error('Failed to load profile: ', error.message)
            }else{
                setProfile(data)
            }
            setLoading(false)
        }
        fetchUserProfile()
    },[router])

    if(loading) return <div className="p-4 text-center">Loading...</div>

    const isGuest = profile?.is_guest || email === 'guest@demo.com'

    return(
        <main className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-lg p-6">
                <CardContent className="space-y-4">
                    <h2 className="text-2xl font-semibold text-center">
                        Welcome, {profile?.username || 'User'}👋
                    </h2>
                    <p className="text-center text-gray-500">{email}</p>

                    {isGuest && (
                        <div className="text-yellow-600 text-center font-medium">
                            You are logged in as guest. Some features are disabled.
                        </div>
                    )}
                    <div className="flex flex-col gap-3 mt-4">
                        {!isGuest &&(
                            <Button onClick={() => router.push('/create')}>➕ Create New Post</Button>
                        )}
                        <Button variant="outline" onClick={() => router.push('/')}>🏠Go to Home</Button>
                    </div>
                    
                </CardContent>
            </Card>
        </main>
    )
}