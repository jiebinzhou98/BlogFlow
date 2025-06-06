'use client'

import { usePathname, useRouter } from "next/navigation"
import { Home, PlusCircle, User } from "lucide-react"

//能跳转的页面
const navItems = [
    { name: 'Explore', icon: <Home className="w-5 h-5" />, href: '/explore' },
    { name: 'Create', icon: <PlusCircle className="w-5 h-5" />, href: '/create' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, href: '/' }
]

export default function BottomNav() {
    const router = useRouter()
    const pathname = usePathname()

    //如果用户点击链接的navitems就转到该指定的页面
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm flex justify-around items-center h-14 md:hidden">
            {navItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    aria-label={item.name}
                    className={`flex flex-col items-center justify-center text-sm focus:outline-none ${pathname === item.href ? 'text-black font-semibold' : 'text-gray-500'}`}
                >
                    {item.icon}
                    <span className="text-xs">{item.name}</span>
                </button>

            ))}
        </nav>
    )
}