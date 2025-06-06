// 'use client'

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { supabase } from "@/lib/supabase"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"

// export default function LoginPage(){
//     const router = useRouter()
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const [loading, setLoading] = useState(false)

//     const handleLogin = async () => {
//         setLoading(true)
//         const {error} = await supabase.auth.signInWithPassword({ email, password})

//         if(error){
//             alert(error.message)
//         }else{
//             router.push('dashboard')
//         }setLoading(false)
//     }

//     return(
//         <main className="flex items-center justify-center min-h-screen">
//             <Card className="w-full max-w-md p-6">
//                 <CardContent className="space-y-4">
//                     <h2 className="text-2xl font-semibold text-center">Login</h2>
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
//                     <Button className="w-full mt-2" onClick={handleLogin} disabled={loading}>
//                         {loading ? 'Logging in ...' : 'Login'}
//                     </Button>
                    
//                     <div className="text-center text-sm text-gray-600">
//                         Don't have an account?{" "}
//                         <button className="text-blue-600 hover:underline" onClick={() => router.push('/register')}>
//                             Register here
//                         </button>
//                     </div>
//                 </CardContent>
//             </Card>
//         </main>
//     )
// }