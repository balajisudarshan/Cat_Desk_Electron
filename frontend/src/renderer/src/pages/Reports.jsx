import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Calendar, BarChart3, Users, DollarSign, CheckCircle } from 'lucide-react'

const reports = [
  {
    title: 'Student Enrollment & Demographics',
    description: 'Detailed analysis of student intake, status breakdown, and batch distribution.',
    category: 'Admissions',
    frequency: 'Monthly',
    lastGenerated: 'Oct 24, 2026',
    icon: Users,
  },
  {
    title: 'Financial & Tuition Clearance',
    description: 'Collection balances, overdue accounts, and payment method summaries.',
    category: 'Finance',
    frequency: 'Bi-weekly',
    lastGenerated: 'Oct 22, 2026',
    icon: DollarSign,
  },
  {
    title: 'Academic Course Performance',
    description: 'Class completion grades, mid-term distributions, and faculty rosters.',
    category: 'Academics',
    frequency: 'Per Semester',
    lastGenerated: 'Oct 15, 2026',
    icon: BarChart3,
  },
  {
    title: 'Attendance & Compliance Ledger',
    description: 'Daily student attendance records, leave logs, and compliance thresholds.',
    category: 'Operations',
    frequency: 'Weekly',
    lastGenerated: 'Yesterday',
    icon: CheckCircle,
  },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 pb-1 border-b border-border/60">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Analytics & Reports
        </h1>
        <p className="text-xs text-muted-foreground">
          Generate, review, and export standardized administrative records and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((rpt) => (
          <Card key={rpt.title} className="rounded-xl border-border bg-card flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary border border-border">
                  <rpt.icon size={18} />
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {rpt.category}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-foreground mt-3">
                {rpt.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {rpt.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-2 border-t border-border/50 bg-secondary/10 flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">
                <span>Updated: {rpt.lastGenerated}</span>
                <span className="mx-1.5">•</span>
                <span>{rpt.frequency}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-border bg-secondary text-foreground hover:bg-secondary/80"
              >
                <Download size={13} />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
