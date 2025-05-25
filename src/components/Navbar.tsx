'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('User')
  const [email, setEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        setUsername(profile?.username || 'User')
        setEmail(user.email || '')
        setIsLoggedIn(true)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-semibold">
        <Link href="/">Blog Platform</Link>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <Link href="/explore">Explore</Link>
        {isLoggedIn && <Link href="/dashboard">Dashboard</Link>}
        {isLoggedIn && (
          <div className="text-sm text-gray-500">{username} ({email})</div>
        )}
        {isLoggedIn ? (
          <>
            <Button onClick={() => router.push('/create')} size="sm">
              ➕ Create
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button size="sm" onClick={() => router.push('/register')}>
              Register
            </Button>
          </>
        )}
      </div>

      <button
        className="md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle Menu"
      >
        <Menu />
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-md p-4 md:hidden z-50">
          <div className="flex flex-col gap-4">
            <Link href="/explore">Explore</Link>
            {isLoggedIn && <Link href="/dashboard">Dashboard</Link>}
            {isLoggedIn && (
              <div className="text-sm text-gray-500">{username} ({email})</div>
            )}
            {isLoggedIn ? (
              <>
                <Button onClick={() => router.push('/create')} size="sm">
                  ➕ Create
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => router.push('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
