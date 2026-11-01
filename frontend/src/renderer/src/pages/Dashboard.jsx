import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  UserPlus,
  BookOpen,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL

  const [studentCount, setStudentCount] = useState(0)
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (API_BASE) {
          const res = await axios.get(`${API_BASE}/student`)
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.students || res.data?.data || []
          setStudentCount(list.length)
          setRecentStudents(list.slice(-5).reverse())
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [API_BASE])

  const stats = [
    {
      title: 'Total Students',
      value: studentCount > 0 ? studentCount : '124',
      change: '+12% from last month',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Courses',
      value: '18',
      change: '+3 new cohorts',
      trend: 'up',
      icon: BookOpen,
    },
    {
      title: 'Fee Collection',
      value: '$48,250',
      change: '94% on-time rate',
      trend: 'up',
      icon: CreditCard,
    },
    {
      title: 'Attendance Rate',
      value: '96.2%',
      change: '+1.4% this week',
      trend: 'up',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-border/60">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Administrative Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time student enrollments, course status, and financial metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/students/add')}
            className="h-8 gap-1.5 bg-primary hover:bg-[#1f6feb] text-primary-foreground text-xs font-medium shadow-xs"
          >
            <UserPlus size={14} />
            Add Student
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/courses')}
            className="h-8 gap-1.5 border-border bg-secondary text-muted-foreground hover:text-foreground text-xs"
          >
            <BookOpen size={14} />
            View Courses
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-xl border-border bg-card">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-secondary text-muted-foreground border border-border/60">
                <stat.icon size={14} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[#3fb950]">
                <ArrowUpRight size={13} />
                <span className="text-[11px] font-medium">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Grid: Recent Students & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Students Table (2 Columns) */}
        <Card className="lg:col-span-2 rounded-xl border-border bg-card overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Recent Students
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Latest students enrolled in the system
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/students')}
              className="h-7 text-xs text-primary hover:text-primary hover:bg-secondary px-2"
            >
              View all
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/40 border-b border-border">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Register No</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Phone</TableHead>
                  <TableHead className="text-right text-muted-foreground text-xs font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentStudents.length > 0 ? (
                  recentStudents.map((st) => (
                    <TableRow key={st.id} className="border-border hover:bg-secondary/30">
                      <TableCell className="font-medium text-foreground text-xs">
                        {st.name}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        {st.reg_no || `#${st.id}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {st.phone || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-border">
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-xs">
                      No recent student registrations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System & Cohort Status (1 Column) */}
        <Card className="rounded-xl border-border bg-card flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b border-border/60">
            <CardTitle className="text-base font-semibold text-foreground">
              Academic Term Status
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Fall 2026 Cohort Progress
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Semester Completion</span>
                <span className="font-semibold text-foreground">68%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-[#3fb950] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-foreground">Mid-Term Assessments Done</p>
                  <p className="text-muted-foreground text-[11px]">All department grades submitted</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock size={15} className="text-[#d29922] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-foreground">Fee Installment #2 Due</p>
                  <p className="text-muted-foreground text-[11px]">Due within 14 calendar days</p>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t border-border bg-secondary/20 rounded-b-xl">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/reports')}
              className="w-full h-8 text-xs border-border bg-secondary text-muted-foreground hover:text-foreground"
            >
              Generate Full Term Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}