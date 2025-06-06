// 'use client'

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { supabase } from "@/lib/supabase"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"

// export default function RegisterPage() {
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const router = useRouter()
//     const [loading, setLoading] = useState(false)

//     const handleRegister = async () => {
//         setLoading(true)

//         if (!email || !password) {
//             alert('Please enter both email and password')
//             setLoading(false)
//             return
//         }
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//         if (!emailRegex.test(email)) {
//             alert("Please enter a valid email address")
//             setLoading(false)
//             return
//         }

//         const { data, error } = await supabase.auth.signUp({
//             email,
//             password,
//         })

//         if (error) {
//             alert(error.message)
//             setLoading(false)
//             return
//         }

//         const userId = data.user?.id
//         if (userId) {
//             await supabase.from('profiles').insert({
//                 id: userId,
//                 username: email.split('@')[0],
//                 avatar_url: '',
//                 bio: '',
//                 is_guest: false
//             })
//         }

//         alert('Registeration successful! Please log in')
//         await supabase.auth.signOut(); // Automatically sign out after registration
//         router.push('/login')
//         setLoading(false)
//     }

//     return (
//         <main className="flex items-center justify-center min-h-screen">
//             <Card className="w-full max-w-md p-6">
//                 <CardContent className="space-y-4">
//                     <h2 className="text-2xl font-semibold text-center">Register</h2>
//                     <Input
//                         placeholder="Email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                     />
//                     <Input
//                         placeholder="Password"
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                     />
//                     <Button className="w-full mt-2" onClick={handleRegister} disabled={loading}>
//                         {loading ? 'Registing...' : 'Register'}
//                     </Button>
//                 </CardContent>
//             </Card>
//         </main>
//     )
// }
