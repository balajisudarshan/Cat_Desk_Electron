import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, RefreshCw, Users, Mail, Phone } from 'lucide-react'

const ListStudents = () => {
  const API_BASE = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const getAllStudents = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/student`)
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.students || response.data?.data || []
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllStudents()
  }, [])

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase()
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.f_name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      String(s.id).includes(q) ||
      s.reg_no?.toLowerCase().includes(q)
    )
  })

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Students Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage student registrations, academic batch assignments, and fee status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, phone, reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-background border-border"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={getAllStudents}
            className="h-9 gap-1 text-xs border-border bg-secondary hover:bg-secondary/80"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/students/add')}
            className="h-9 gap-1.5 bg-primary hover:bg-[#1f6feb] text-primary-foreground font-medium shadow-xs transition-colors"
          >
            <Plus size={15} />
            Add Student
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-secondary/40 border-b border-border">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-16 text-muted-foreground text-xs font-semibold">ID</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Student Name</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Father Name</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Contact</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Address</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs font-semibold">Enrolled</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="border-border">
                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-primary" />
                    <span className="text-sm">Loading student directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users size={24} className="text-muted-foreground/60" />
                    <span className="text-sm font-medium text-foreground">No students found</span>
                    <span className="text-xs text-muted-foreground">
                      {search ? 'Try modifying your search criteria.' : 'Start by registering your first student.'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="border-border hover:bg-secondary/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/students/${student.id}?regNo=${student.reg_no}`)}
                >
                  <TableCell className="font-mono text-muted-foreground text-xs">
                    #{student.id}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground border border-border">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div className="leading-tight">{student.name}</div>
                        {student.reg_no && (
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {student.reg_no}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {student.f_name || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col gap-0.5">
                      {student.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                          <Phone size={11} className="text-muted-foreground shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail size={11} className="text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px]">{student.email}</span>
                        </div>
                      )}
                      {!student.phone && !student.email && '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">
                    {student.address || '-'}
                  </TableCell>
                  <TableCell>
                    {student.status !== false && student.status !== 0 ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-muted-foreground">
                    {formatDate(student.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredStudents.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <span>CampusDesk Student Records</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListStudents
