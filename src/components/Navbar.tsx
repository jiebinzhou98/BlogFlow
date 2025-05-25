'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
    const [loggedIn, setLoggedIn] = useState(false)
    const [isGuest, setIsGuest] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const {data: userData} = await supabase.auth.getUser()
            const user = userData?.user

            if(user) {
                setLoggedIn(true)
                setIsGuest(user.email?.startsWith('guest_') || false)
            }else{
                setLoggedIn(false)
            }
        }
        checkUser()
    }, [pathname])

    const handleLogout = async () =>{
        await supabase.auth.signOut()
        router.push('login')
    }

    return(
        <nav className='bg-white shadow-md px-6 py-4 flex items-center justify-between'>
            <div className='flex items-center gap-6 text-lg font-medium'>
                <Link href="/">Home</Link>
                <Link href="/explore">Explore</Link>
                {loggedIn && <Link href="/dashboard">Dashboard</Link>}
            </div>
            <div>
                {!loggedIn ? (
                    <div className='flex gap-4'>
                        <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
                        <Button onClick={() => router.push('.register')}>Register</Button>
                    </div>
                ): (
                    <div className='flex items-center gap-4'>
                        {isGuest && <span className='text-sm text-yellow-600'>Guest Mode</span>}
                        <Button variant="outline" onClick={handleLogout}>Logout</Button>
                    </div>
                )}
            </div>
        </nav>
    )
}