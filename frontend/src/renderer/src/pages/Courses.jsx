import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
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
import { BookOpen, Plus, Search, Users, RefreshCw, Loader2, Clock, DollarSign } from 'lucide-react'

import AddCourseModal from '@/components/modals/AddCourseModal'
const API_BASE = import.meta.env.VITE_API_URL

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch all courses from backend
  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/course`)
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.courses || res.data?.data || []
      setCourses(data)
    } catch (error) {
      console.warn('GET /course failed, trying /courses:', error?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const query = search.trim().toLowerCase()
  const filtered = courses.filter((c) => {
    if (!query) return true
    return (
      c.name?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.duration?.toLowerCase().includes(query) ||
      String(c.id).includes(query)
    )
  })

  // Course suggestions for autocomplete dropdown
  const suggestions = courses.filter((c) =>
    c.name?.toLowerCase().includes(query)
  )

  const handleSelectCourse = (courseName) => {
    setSearch(courseName)
    setIsOpen(false)
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div ref={dropdownRef} className="relative w-full max-w-sm">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => {
                  if (search.trim()) setIsOpen(true)
                }}
                className="pl-9 pr-8 h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
              />
              {loading && (
                <Loader2
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                />
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && search.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-md border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCourse(c.name)}
                      className="flex items-center justify-between p-2.5 text-xs text-foreground hover:bg-secondary cursor-pointer border-b border-border/40 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          {c.duration && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {c.duration}
                            </p>
                          )}
                        </div>
                      </div>
                      {c.total_fee !== undefined && (
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          ₹{c.total_fee}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No courses matching "{search}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCourses}
              disabled={loading}
              className="h-9 gap-1.5 border-border bg-secondary text-muted-foreground hover:text-foreground"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>

            <Button
              size="sm"
              className="h-9 gap-1.5 bg-primary hover:bg-[#1f6feb] text-primary-foreground font-medium shadow-xs"
              onClick={() => setOpenModal(true)}
            >
              <Plus size={15} />
              Create Course
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-secondary/40 border-b border-border">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16 text-muted-foreground text-xs font-semibold">ID</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Course Name</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Duration</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Total Fee</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Batches</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Description</TableHead>
                <TableHead className="text-right text-muted-foreground text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && courses.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-primary" />
                      <span className="text-xs">Loading course directory...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookOpen size={22} className="text-muted-foreground/60" />
                      <span className="text-sm font-medium text-foreground">No courses found</span>
                      <span className="text-xs text-muted-foreground">
                        {search ? 'Try modifying your search query.' : 'No courses registered in the database.'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((course) => (
                  <TableRow key={course.id} className="border-border hover:bg-secondary/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{course.id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-primary border border-border">
                          <BookOpen size={14} />
                        </div>
                        <span>{course.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {course.duration || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {course.total_fee !== undefined ? `₹${course.total_fee}` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-muted-foreground" />
                        <span>{course.batches?.length || 0} batches</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                      {course.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
              <span>Showing {filtered.length} of {courses.length} courses</span>
              <span>CampusDesk Academic Catalog</span>
            </div>
          )}
        </div>
      </div>
      <AddCourseModal open={openModal} onOpenChange={setOpenModal} onSuccess={fetchCourses} />

    </>
  )
}
