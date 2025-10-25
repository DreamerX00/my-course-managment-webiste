"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trophy, Medal, Award, TrendingUp, Crown, Loader2 } from "lucide-react"

interface LeaderboardEntry {
  id: string
  name: string
  displayAvatar: string
  title: string | null
  totalScore: number
  attemptCount: number
  rank: number
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  currentUser: LeaderboardEntry | null
  total: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ period, ...(search && { search }) })
        const response = await fetch(/api/leaderboard?)
        if (!response.ok) throw new Error("Failed to fetch")
        const leaderboardData = await response.json()
        setData(leaderboardData)
      } catch (error) {
        console.error("Failed to load leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeaderboard()
  }, [search, period])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />
    return null
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container py-12 max-w-6xl">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-5xl font-bold">Leaderboard</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {data && data.leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card><CardHeader className="text-center">
              {getRankIcon(2)}
              <Avatar className="w-20 h-20 mx-auto my-3 border-4 border-gray-400">
                <AvatarImage src={data.leaderboard[1].displayAvatar} />
                <AvatarFallback>{getInitials(data.leaderboard[1].name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{data.leaderboard[1].name}</CardTitle>
            </CardHeader><CardContent className="text-center">
              <div className="text-3xl font-bold">{data.leaderboard[1].totalScore}</div>
            </CardContent></Card>

            <Card className="border-2 border-yellow-500/50"><CardHeader className="text-center">
              {getRankIcon(1)}
              <Avatar className="w-24 h-24 mx-auto my-3 border-4 border-yellow-500">
                <AvatarImage src={data.leaderboard[0].displayAvatar} />
                <AvatarFallback>{getInitials(data.leaderboard[0].name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{data.leaderboard[0].name}</CardTitle>
            </CardHeader><CardContent className="text-center">
              <div className="text-4xl font-bold text-yellow-600">{data.leaderboard[0].totalScore}</div>
            </CardContent></Card>

            <Card><CardHeader className="text-center">
              {getRankIcon(3)}
              <Avatar className="w-20 h-20 mx-auto my-3 border-4 border-orange-600">
                <AvatarImage src={data.leaderboard[2].displayAvatar} />
                <AvatarFallback>{getInitials(data.leaderboard[2].name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{data.leaderboard[2].name}</CardTitle>
            </CardHeader><CardContent className="text-center">
              <div className="text-3xl font-bold">{data.leaderboard[2].totalScore}</div>
            </CardContent></Card>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
          <CardContent>
            {data?.leaderboard.map((entry) => (
              <div key={entry.id} className={lex items-center gap-4 p-4 rounded-lg border mb-2 }>
                <div className="w-12 text-center">{entry.rank <= 3 ? getRankIcon(entry.rank) : <Badge>#{entry.rank}</Badge>}</div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={entry.displayAvatar} />
                  <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{entry.name}</h4>
                  {entry.title && <p className="text-sm text-muted-foreground">{entry.title}</p>}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{entry.totalScore}</div>
                  <p className="text-xs text-muted-foreground">{entry.attemptCount} attempts</p>
                </div>
              </div>
            ))}
            {data && data.leaderboard.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p>No rankings yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
