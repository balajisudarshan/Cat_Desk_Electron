import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  CreditCard,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Receipt,
  FileText,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react'

export default function Payments() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL

  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalBilled: 0,
    completedCount: 0,
    pendingCount: 0,
    totalInvoices: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/payment`)
      const paymentList = res.data?.payments || []
      const summaryData = res.data?.summary || {
        totalCollected: 0,
        totalPending: 0,
        totalBilled: 0,
        completedCount: 0,
        pendingCount: 0,
        totalInvoices: 0,
      }
      setPayments(paymentList)
      setSummary(summaryData)
    } catch (err) {
      console.error('Error fetching payments:', err)
      toast.error(err?.response?.data?.message || 'Failed to fetch payments data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [API_BASE])

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.student || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.regNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.method || '').toLowerCase().includes(search.toLowerCase())

    if (statusFilter === 'ALL') return matchesSearch
    return matchesSearch && p.status.toUpperCase() === statusFilter
  })

  // Export payments as CSV statement
  const handleExportStatement = () => {
    if (payments.length === 0) {
      toast.error('No payments data available to export')
      return
    }

    const headers = [
      'Invoice ID',
      'Student Name',
      'Registration No',
      'Total Fee',
      'Discount',
      'Final Fee',
      'Total Paid',
      'Balance Due',
      'Payment Method',
      'Date',
      'Status',
    ]

    const rows = payments.map((p) => [
      p.id,
      `"${p.student}"`,
      p.regNo,
      p.totalFee,
      p.discount,
      p.finalFee,
      p.totalPaid,
      p.balance,
      p.method,
      p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'N/A',
      p.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `payments_statement_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('Payments statement exported successfully!')
  }

  // Quick download receipt for an invoice row
  const handleDownloadInvoiceReceipt = async (e, regNo) => {
    e.stopPropagation()
    try {
      const res = await axios.post(
        `${API_BASE}/receipt/${regNo}`,
        {},
        { responseType: 'blob' }
      )
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const fileURL = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = fileURL
      link.setAttribute('download', `Receipt-${regNo}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(fileURL)
      toast.success(`Receipt for ${regNo} downloaded`)
    } catch (err) {
      console.error('Error downloading receipt:', err)
      toast.error('Failed to download receipt')
    }
  }

  return (
    <div className="space-y-6">
      {/* Real Summary / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collected */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Collected</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-foreground">
              ₹{Number(summary.totalCollected || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summary.completedCount} fully paid {summary.completedCount === 1 ? 'account' : 'accounts'}
            </p>
          </CardContent>
        </Card>

        {/* Pending Invoices / Dues */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Outstanding Dues</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              ₹{Number(summary.totalPending || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summary.pendingCount} {summary.pendingCount === 1 ? 'student awaiting clearance' : 'students awaiting clearance'}
            </p>
          </CardContent>
        </Card>

        {/* Total Billed / Revenue */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invoiced</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText size={16} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-foreground">
              ₹{Number(summary.totalBilled || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {summary.totalInvoices} total enrollment {summary.totalInvoices === 1 ? 'invoice' : 'invoices'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Controls & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-2 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={15} />
            <Input
              placeholder="Search invoice ID, student or reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-md border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40 text-sm"
            />
          </div>

          {/* Status Filter Badges / Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {['ALL', 'PAID', 'PARTIAL', 'PENDING'].map((status) => (
              <Button
                key={status}
                type="button"
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`h-8 px-2.5 text-xs font-medium ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            disabled={loading}
            className="h-9 gap-1.5 border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatement}
            className="h-9 gap-1.5 border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download size={14} />
            Export Statement
          </Button>
        </div>
      </div>

      {/* Real Invoices Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-secondary/40 border-b border-border">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-28 text-muted-foreground text-xs font-semibold">Invoice</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Student</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Final Fee</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Paid</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Balance Due</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Method</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Date</TableHead>
              <TableHead className="text-center text-muted-foreground text-xs font-semibold">Status</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="border-border">
                <TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw size={20} className="animate-spin text-primary" />
                    <span className="text-xs">Loading real payments data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CreditCard size={28} className="text-muted-foreground/40" />
                    <span className="text-sm font-medium text-foreground">No payment records found</span>
                    <span className="text-xs text-muted-foreground">
                      {search
                        ? 'Try modifying your search or filter criteria.'
                        : 'New invoices and student enrollments will appear here automatically.'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() =>
                    navigate(`/students/${item.studentId}?regNo=${item.regNo}`)
                  }
                  className="border-border hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    <div className="flex items-center gap-1">
                      {item.id}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-foreground text-sm">
                    <div className="font-medium text-foreground">{item.student}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.regNo}</div>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    ₹{item.finalFee.toLocaleString('en-IN')}
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                    ₹{item.totalPaid.toLocaleString('en-IN')}
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold">
                    <span
                      className={
                        item.balance > 0
                          ? 'text-amber-600 dark:text-amber-500'
                          : 'text-muted-foreground'
                      }
                    >
                      ₹{item.balance.toLocaleString('en-IN')}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs">
                    <Badge variant="outline" className="uppercase font-mono text-[10px] tracking-wider">
                      {item.method}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-xs">
                    {item.date
                      ? new Date(item.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.status === 'Paid' && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[11px]"
                      >
                        Paid
                      </Badge>
                    )}
                    {item.status === 'Partial' && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px]"
                      >
                        Partial
                      </Badge>
                    )}
                    {item.status === 'Pending' && (
                      <Badge variant="destructive" className="text-[11px]">
                        Pending
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDownloadInvoiceReceipt(e, item.regNo)}
                      title="Download PDF Receipt"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
                    >
                      <Receipt size={13} />
                      <span className="hidden md:inline">Receipt</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
