import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Tag,
  Receipt,
  User,
  Plus,
  Loader2,
  Download,
  Printer,
} from 'lucide-react'

export default function ViewStudent() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL

  const queryRegNo = searchParams.get('regNo')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Course Enrollment Form States
  const [allCourses, setAllCourses] = useState([])
  const [courseName, setCourseName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [showDiscountTab, setShowDiscountTab] = useState(false)
  const [discount, setDiscount] = useState('')
  const [paymentMode, setPaymentMode] = useState('full-payment')
  const [paymentType, setPaymentType] = useState('upi')
  const [amountPaid, setAmountPaid] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const courseDropdownRef = useRef(null)

  // Add Payment / Update Due Form States (Accordion)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('upi')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // Receipt Modal States
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedReceiptIds, setSelectedReceiptIds] = useState([])
  const [generatingPdf, setGeneratingPdf] = useState(false)

  // Fetch student history and profile
  const fetchStudentHistory = async () => {
    setLoading(true)
    setError('')
    try {
      let regNo = queryRegNo

      // Fallback: If regNo is not provided in query param, fetch student by id first
      if (!regNo && id) {
        const studentRes = await axios.get(`${API_BASE}/student/${id}`)
        regNo = studentRes.data?.reg_no || studentRes.data?.regNo
      }

      if (regNo) {
        const res = await axios.get(`${API_BASE}/history/${regNo}`)
        setData(res.data)
      } else {
        setError('Registration number not found for this student.')
      }
    } catch (err) {
      console.error('Error fetching student history:', err)
      setError(err?.response?.data?.message || 'Failed to load student details')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all available courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/course`)
        const courseList = Array.isArray(res.data)
          ? res.data
          : res.data?.courses || res.data?.data || []
        setAllCourses(courseList)
      } catch (err) {
        console.error('Error fetching courses list:', err)
      }
    }
    fetchCourses()
  }, [API_BASE])

  useEffect(() => {
    fetchStudentHistory()
  }, [id, queryRegNo])

  // Click outside to close course suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Course Selection Handlers
  const handleSelectedCourses = (course) => {
    setSelectedCourses((prev) => {
      if (prev.some((item) => item.id === course.id)) return prev
      return [...prev, course]
    })
    setCourseName('')
    setShowSuggestions(false)
  }

  const removeSelectedCourse = (course) => {
    setSelectedCourses((prev) => prev.filter((item) => item.id !== course.id))
  }

  // Calculated totals for the new course form
  const newTotalFee = selectedCourses.reduce((sum, course) => {
    const fee = Number(course.total_fee ?? course.totalFee ?? 0)
    return sum + fee
  }, 0)

  // Ensure discount does not exceed total fee
  useEffect(() => {
    if (Number(discount) > newTotalFee) {
      setDiscount(newTotalFee > 0 ? newTotalFee : '')
    }
  }, [newTotalFee])

  const handleDiscountChange = (e) => {
    const val = e.target.value
    if (val === '') {
      setDiscount('')
      return
    }
    const num = Number(val)
    if (num < 0) {
      setDiscount(0)
    } else if (num > newTotalFee) {
      setDiscount(newTotalFee)
    } else {
      setDiscount(num)
    }
  }

  const numericDiscount = Math.min(Number(discount) || 0, newTotalFee)
  const newFinalAmount = Math.max(0, newTotalFee - numericDiscount)

  const filteredCourses = (Array.isArray(allCourses) ? allCourses : []).filter((course) => {
    const name = course.name || course.courseName || ''
    return name.toLowerCase().includes(courseName.trim().toLowerCase())
  })

  // Submit enrollment for new course
  const handleEnrollNewCourse = async (e) => {
    e.preventDefault()

    if (!data?.student?.reg_no) {
      toast.error('Student registration number not found')
      return
    }

    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course')
      return
    }

    const paid = paymentMode === 'full-payment'
      ? newFinalAmount
      : Number(amountPaid) || 0

    if (paymentMode === 'installment') {
      if (paid <= 0) {
        toast.error('Please enter an initial payment amount greater than ₹0')
        return
      }
      if (paid > newFinalAmount) {
        toast.error(`Initial payment cannot exceed the total payable amount of ₹${newFinalAmount}`)
        return
      }
    }

    setEnrolling(true)
    const enrollmentData = {
      reg_no: data.student.reg_no,
      course_ids: selectedCourses.map((c) => c.id),
      discount: numericDiscount,
      payment_mode: paymentMode,
      payment_type: paymentType,
      amount_paid: paid,
    }

    try {
      const res = await axios.post(`${API_BASE}/enrollment`, enrollmentData)
      toast.success(res.data?.message || 'New course enrolled successfully!')
      // Reset form fields
      setSelectedCourses([])
      setDiscount('')
      setShowDiscountTab(false)
      setAmountPaid('')
      setCourseName('')
      // Re-fetch student history to immediately show the newly added course and payment
      await fetchStudentHistory()
    } catch (err) {
      console.error('Error adding course:', err)
      toast.error(err?.response?.data?.message || 'Failed to enroll course')
    } finally {
      setEnrolling(false)
    }
  }

  // Submit recorded payment (Add Payment Accordion)
  const handleRecordPayment = async (e) => {
    e.preventDefault()

    const num = Number(payAmount)
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid payment amount greater than ₹0')
      return
    }

    if (num > balance) {
      toast.error(`Payment amount cannot exceed the pending balance of ₹${Number(balance).toLocaleString('en-IN')}`)
      return
    }

    setSubmittingPayment(true)
    try {
      const res = await axios.post(`${API_BASE}/payment/add`, {
        reg_no: data.student.reg_no,
        amount_paid: num,
        payment_method: payMethod,
      })

      toast.success(res.data?.message || `Payment of ₹${num.toLocaleString('en-IN')} recorded successfully!`)
      setPayAmount('')
      // Re-fetch student history to immediately update the balance and transaction list
      await fetchStudentHistory()
    } catch (err) {
      console.error('Error adding payment:', err)
      toast.error(err?.response?.data?.message || 'Failed to record payment')
    } finally {
      setSubmittingPayment(false)
    }
  }

  // --- Receipt Modal Logic ---
  const paymentHistoryList = data?.paymentHistory || []

  const openReceiptModal = () => {
    if (paymentHistoryList.length === 0) {
      toast.error('No payment transactions recorded to generate a receipt.')
      return
    }
    setSelectedReceiptIds(paymentHistoryList.map((h) => h.id || h.receipt_id))
    setReceiptModalOpen(true)
  }

  const isAllSelected =
    paymentHistoryList.length > 0 && selectedReceiptIds.length === paymentHistoryList.length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedReceiptIds([])
    } else {
      setSelectedReceiptIds(paymentHistoryList.map((h) => h.id || h.receipt_id))
    }
  }

  const toggleReceiptItem = (receiptId) => {
    setSelectedReceiptIds((prev) =>
      prev.includes(receiptId) ? prev.filter((id) => id !== receiptId) : [...prev, receiptId]
    )
  }

  const selectedTotalAmount = paymentHistoryList
    .filter((h) => selectedReceiptIds.includes(h.id || h.receipt_id))
    .reduce((sum, item) => sum + (Number(item.amount_paid) || 0), 0)

  const fetchReceiptPdfBlob = async () => {
    if (selectedReceiptIds.length === 0) {
      toast.error('Please select at least one transaction')
      return null
    }

    const res = await axios.post(
      `${API_BASE}/receipt/${data.student.reg_no}`,
      { history_ids: selectedReceiptIds },
      { responseType: 'blob' }
    )
    return new Blob([res.data], { type: 'application/pdf' })
  }

  const handleDownloadReceipt = async () => {
    setGeneratingPdf(true)
    try {
      const blob = await fetchReceiptPdfBlob()
      if (!blob) return

      const fileURL = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = fileURL
      link.setAttribute('download', `Receipt-${data.student.reg_no}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(fileURL)

      toast.success('Fee receipt downloaded successfully!')
      setReceiptModalOpen(false)
    } catch (err) {
      console.error('Receipt generation error:', err)
      toast.error(err?.response?.data?.message || 'Failed to generate receipt PDF')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handlePrintReceipt = async () => {
    setGeneratingPdf(true)
    try {
      const blob = await fetchReceiptPdfBlob()
      if (!blob) return

      const fileURL = window.URL.createObjectURL(blob)
      window.open(fileURL, '_blank')
      toast.success('Receipt opened for printing/preview')
      setReceiptModalOpen(false)
    } catch (err) {
      console.error('Receipt preview error:', err)
      toast.error(err?.response?.data?.message || 'Failed to open receipt')
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw size={24} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading student profile...</p>
      </div>
    )
  }

  if (error || !data || !data.student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground">Student Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {error || 'Unable to retrieve the student profile information.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/students')}
          className="gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Button>
      </div>
    )
  }

  const { student, enrollments = [], payments = [], paymentHistory = [] } = data

  // Financial calculations from payments or fallback to enrollments
  const latestPayment = payments[0] || null
  const totalFee =
    latestPayment?.total_fee ??
    enrollments.reduce((sum, e) => sum + (Number(e.course_fee) || 0), 0)
  const discountAmount = latestPayment?.discount ?? 0
  const finalFee = latestPayment?.final_fee ?? Math.max(0, totalFee - discountAmount)
  const totalPaid =
    latestPayment?.total_paid ??
    paymentHistory.reduce((sum, h) => sum + (Number(h.amount_paid) || 0), 0)
  const balance =
    latestPayment?.balance !== undefined
      ? Number(latestPayment.balance)
      : Math.max(0, finalFee - totalPaid)
  const currentPaymentMode = latestPayment?.payment_mode || 'N/A'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Action Header */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/students')}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Students
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchStudentHistory}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={openReceiptModal}
            className="h-8 gap-1.5 text-xs bg-primary hover:bg-[#1f6feb] text-primary-foreground font-medium shadow-xs cursor-pointer"
          >
            <Receipt size={13} />
            Generate Receipt
          </Button>
        </div>
      </div>

      {/* Student Profile Hero Card */}
      <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-2xl shadow-xs">
                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    {student.name}
                  </h1>
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                    {student.reg_no}
                  </Badge>
                  <Badge
                    variant={student.status ? 'secondary' : 'destructive'}
                    className={
                      student.status
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : ''
                    }
                  >
                    <span
                      className={`inline-block size-1.5 rounded-full mr-1.5 ${
                        student.status ? 'bg-emerald-500' : 'bg-destructive'
                      }`}
                    />
                    {student.status ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User size={13} className="text-muted-foreground" />
                  ID #{student.id} &bull; Registered Student
                </p>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto text-xs">
              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/30 px-3.5 py-2">
                <Phone size={14} className="text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Phone</p>
                  <p className="font-medium text-foreground truncate">{student.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/30 px-3.5 py-2">
                <Mail size={14} className="text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Email</p>
                  <p className="font-medium text-foreground truncate">{student.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/30 px-3.5 py-2 sm:col-span-2 md:col-span-1">
                <MapPin size={14} className="text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Address</p>
                  <p className="font-medium text-foreground truncate">{student.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fee */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Course Fee</p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                ₹{Number(totalFee).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'} enrolled
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Discount */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Discount Applied</p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                ₹{Number(discountAmount).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Payable: ₹{Number(finalFee).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Tag size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Paid</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">
                ₹{Number(totalPaid).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                Mode: {currentPaymentMode.replace('-', ' ')}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Balance */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Balance Due</p>
              <h3
                className={`text-xl font-bold mt-1 ${
                  balance > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'
                }`}
              >
                ₹{Number(balance).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {balance === 0 ? 'Fully Paid' : 'Pending payment'}
              </p>
            </div>
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                balance > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              {balance > 0 ? <Clock size={18} /> : <CheckCircle2 size={18} />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accordion: Quick Actions (Enroll New Course & Record Payment) */}
      <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Accordion className="w-full">
          {/* Accordion Item 1: Enroll in New Course */}
          <AccordionItem value="enroll-course" className="border-b border-border/60">
            <AccordionTrigger className="px-6 py-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Enroll New Course</h3>
                  <p className="text-xs text-muted-foreground font-normal">
                    Register student into another course and record initial fee
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pt-4 pb-6 border-t border-border/60">
              <form onSubmit={handleEnrollNewCourse} className="space-y-5">
                {/* Two-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  {/* Course Search Dropdown */}
                  <div ref={courseDropdownRef} className="relative space-y-1.5">
                    <Label htmlFor="courseName" className="text-xs font-medium text-foreground">
                      Course Name
                    </Label>
                    <Input
                      id="courseName"
                      name="courseName"
                      placeholder="Search or enter course name"
                      autoComplete="off"
                      value={courseName}
                      onChange={(e) => {
                        setCourseName(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => {
                        if (courseName.trim()) setShowSuggestions(true)
                      }}
                      className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                    />

                    {showSuggestions && courseName.trim() !== '' && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => (
                            <button
                              key={course.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectedCourses(course)}
                              className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-foreground hover:bg-secondary cursor-pointer border-b border-border/40 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-primary shrink-0" />
                                <div>
                                  <span className="font-medium text-foreground">
                                    {course.name || course.courseName}
                                  </span>
                                  {course.duration && (
                                    <span className="text-[11px] text-muted-foreground ml-2">
                                      ({course.duration})
                                    </span>
                                  )}
                                </div>
                              </div>
                              {course.total_fee !== undefined && (
                                <span className="font-mono text-xs text-muted-foreground font-semibold">
                                  ₹{course.total_fee}
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            No course found matching "{courseName}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Courses Display */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Selected Courses
                    </Label>
                    <div className="flex flex-wrap items-center gap-2 min-h-9 pt-1">
                      {selectedCourses.length > 0 ? (
                        selectedCourses.map((course) => (
                          <Badge
                            key={course.id}
                            variant="secondary"
                            className="cursor-pointer transition-colors hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeSelectedCourse(course)}
                          >
                            {course.name} (₹{course.total_fee || course.totalFee || 0}) ✕
                          </Badge>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">No Course Selected</div>
                      )}
                    </div>
                  </div>

                  {/* Payment Mode & Initial Payment Input */}
                  <div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">
                        Select Payment Mode
                      </Label>
                      <RadioGroup
                        value={paymentMode}
                        onValueChange={setPaymentMode}
                        className="flex items-center gap-4 pt-1"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="full-payment" id="view-full-payment" />
                          <Label htmlFor="view-full-payment" className="text-xs cursor-pointer">
                            Full Payment
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="installment" id="view-installment" />
                          <Label htmlFor="view-installment" className="text-xs cursor-pointer">
                            Installment
                          </Label>
                        </div>
                      </RadioGroup>

                      {paymentMode === 'installment' && (
                        <div className="space-y-1 pt-3">
                          <Label htmlFor="view-amountPaid" className="text-xs font-medium text-foreground">
                            Initial Amount Paid (₹)
                          </Label>
                          <Input
                            id="view-amountPaid"
                            name="amountPaid"
                            type="number"
                            min="1"
                            max={newFinalAmount}
                            placeholder="Enter paid amount"
                            value={amountPaid}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '') {
                                setAmountPaid('')
                                return
                              }
                              const num = Number(val)
                              if (num < 0) {
                                setAmountPaid('')
                              } else if (num > newFinalAmount) {
                                setAmountPaid(newFinalAmount)
                              } else {
                                setAmountPaid(num)
                              }
                            }}
                            className="h-9 w-full sm:w-48 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                          />
                        </div>
                      )}
                    </div>

                    {/* Payment Type */}
                    <div className="space-y-1.5 mt-5">
                      <Label className="text-xs font-medium text-foreground">
                        Select Payment Type
                      </Label>
                      <RadioGroup
                        value={paymentType}
                        onValueChange={setPaymentType}
                        className="flex items-center gap-4 pt-1"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="upi" id="view-upi" />
                          <Label htmlFor="view-upi" className="text-xs cursor-pointer">
                            UPI
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="card" id="view-card" />
                          <Label htmlFor="view-card" className="text-xs cursor-pointer">
                            Card
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="cash" id="view-cash" />
                          <Label htmlFor="view-cash" className="text-xs cursor-pointer">
                            Cash
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Discount & Price Summary */}
                  <div className="flex flex-col items-end gap-3 justify-center">
                    {!showDiscountTab && (
                      <h1
                        className="font-medium text-primary cursor-pointer text-xs hover:underline"
                        onClick={() => setShowDiscountTab(true)}
                      >
                        + Add Discount
                      </h1>
                    )}
                    {showDiscountTab && (
                      <div className="flex gap-2 items-center">
                        <Input
                          id="view-discount"
                          name="discount"
                          type="number"
                          min="0"
                          max={newTotalFee}
                          placeholder="Enter discount"
                          value={discount}
                          onChange={handleDiscountChange}
                          className="h-9 w-36 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                        />
                        <Button
                          type="button"
                          className="h-9 rounded-md bg-destructive hover:bg-destructive/80 text-destructive-foreground text-xs font-medium transition-colors shadow-xs cursor-pointer"
                          onClick={() => {
                            setShowDiscountTab(false)
                            setDiscount('')
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}

                    <h2 className="font-medium text-gray-500 text-xs">
                      Total Course Fee : ₹{newTotalFee.toLocaleString('en-IN')}
                    </h2>
                    {showDiscountTab && numericDiscount > 0 && (
                      <h2 className="font-medium text-emerald-600 text-xs">
                        Discount : -₹{numericDiscount.toLocaleString('en-IN')}
                      </h2>
                    )}
                    <h3 className="font-semibold text-primary text-base">
                      Final Amount : ₹{newFinalAmount.toLocaleString('en-IN')}
                    </h3>
                    {paymentMode === 'installment' && Number(amountPaid) > 0 && (
                      <>
                        <h4 className="font-medium text-emerald-600 text-xs">
                          Paid Now : ₹{Number(amountPaid).toLocaleString('en-IN')}
                        </h4>
                        <h4 className="font-medium text-amber-600 text-xs">
                          Remaining Due : ₹{Math.max(0, newFinalAmount - Number(amountPaid)).toLocaleString('en-IN')}
                        </h4>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Enrollment Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={enrolling || selectedCourses.length === 0}
                    className="w-full h-9 rounded-md bg-primary hover:bg-[#1f6feb] text-primary-foreground text-sm font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 size={15} className="animate-spin mr-1.5" />
                        Enrolling Course...
                      </>
                    ) : (
                      'Confirm & Enroll Course'
                    )}
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion Item 2: Record Payment / Update Dues */}
          <AccordionItem value="record-payment" className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Record Payment / Update Dues</h3>
                    <p className="text-xs text-muted-foreground font-normal">
                      Collect installment or clear student outstanding balance
                    </p>
                  </div>
                </div>

                <div>
                  {balance > 0 ? (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/5 font-mono">
                      Due: ₹{Number(balance).toLocaleString('en-IN')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                      All Dues Cleared
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pt-4 pb-6 border-t border-border/60">
              <form onSubmit={handleRecordPayment} className="space-y-4">
                {/* Balance display banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-secondary/30">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Outstanding Balance Due</span>
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-500">
                      ₹{Number(balance).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {balance > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPayAmount(String(balance))}
                      className="h-8 text-xs border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                    >
                      Pay Full Due (₹{Number(balance).toLocaleString('en-IN')})
                    </Button>
                  )}
                </div>

                {balance > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Payment Amount */}
                      <div className="space-y-1.5">
                        <Label htmlFor="payAmountInput" className="text-xs font-medium text-foreground">
                          Payment Amount (₹)
                        </Label>
                        <Input
                          id="payAmountInput"
                          type="number"
                          min="1"
                          max={balance}
                          required
                          placeholder={`Enter amount to pay (max ₹${balance})`}
                          value={payAmount}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '') {
                              setPayAmount('')
                              return
                            }
                            const n = Number(val)
                            if (n < 0) setPayAmount('')
                            else if (n > balance) setPayAmount(String(balance))
                            else setPayAmount(val)
                          }}
                          className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                        />
                        {Number(payAmount) > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            Remaining balance after this payment:{' '}
                            <span className="font-semibold text-foreground">
                              ₹{Math.max(0, balance - Number(payAmount)).toLocaleString('en-IN')}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">
                          Payment Method
                        </Label>
                        <RadioGroup
                          value={payMethod}
                          onValueChange={setPayMethod}
                          className="flex items-center gap-4 pt-1"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="upi" id="acc-pay-upi" />
                            <Label htmlFor="acc-pay-upi" className="text-xs cursor-pointer">
                              UPI
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="card" id="acc-pay-card" />
                            <Label htmlFor="acc-pay-card" className="text-xs cursor-pointer">
                              Card
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="cash" id="acc-pay-cash" />
                            <Label htmlFor="acc-pay-cash" className="text-xs cursor-pointer">
                              Cash
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        type="submit"
                        disabled={submittingPayment || !payAmount || Number(payAmount) <= 0}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-9 px-5 shadow-xs cursor-pointer"
                      >
                        {submittingPayment ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Recording Payment...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Confirm & Record Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>All student course fees are completely paid. No pending dues to clear.</span>
                  </div>
                )}
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Two Column Section: Enrolled Courses & Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  Enrolled Courses
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Academic courses and batch assignments
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {enrollments.length} {enrollments.length === 1 ? 'Course' : 'Courses'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {enrollments.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <BookOpen size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                No courses enrolled for this student.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/40 border-b border-border">
                  <TableRow className="border-border">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Course</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Batch</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Schedule</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((course, idx) => (
                    <TableRow key={idx} className="border-border hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-medium text-xs text-foreground">
                        {course.course_name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {course.batch_name ? (
                          <Badge variant="outline" className="text-[11px] font-normal">
                            {course.batch_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/60">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={11} className="text-muted-foreground shrink-0" />
                          {course.timings || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs text-foreground">
                        ₹{Number(course.course_fee || 0).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment History Card */}
        <Card className="rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Receipt size={16} className="text-primary" />
                  Payment Transactions
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Receipts and payment history records
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openReceiptModal}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Receipt size={12} />
                  Generate Receipt
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {paymentHistory.length} {paymentHistory.length === 1 ? 'Receipt' : 'Receipts'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {paymentHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <CreditCard size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                No payment transactions recorded yet.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/40 border-b border-border">
                  <TableRow className="border-border">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Txn ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Method</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((item, idx) => (
                    <TableRow key={idx} className="border-border hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{item.id || item.payment_id || idx + 1}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar size={11} className="text-muted-foreground shrink-0" />
                          {item.payment_date
                            ? new Date(item.payment_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="uppercase font-mono text-[10px] tracking-wider">
                          {item.payment_method || 'Cash'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-500">
                        +₹{Number(item.amount_paid || 0).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Generate Receipt Modal --- */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Receipt className="text-primary size-5" />
              Generate Fee Receipt
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select which payment transactions to include on the official fee receipt for{' '}
              <span className="font-semibold text-foreground">{student.name}</span> ({student.reg_no}).
            </DialogDescription>
          </DialogHeader>

          {/* Quick Selection Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
            <label className="flex items-center gap-2.5 text-xs font-medium text-foreground cursor-pointer select-none">
              <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
              <span>Select All Transactions ({paymentHistoryList.length})</span>
            </label>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Total Selected</span>
              <span className="text-xs font-semibold text-primary">
                ₹{selectedTotalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Transaction Checkboxes List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {paymentHistoryList.map((item, idx) => {
              const itemId = item.id || item.receipt_id || idx + 1
              const isChecked = selectedReceiptIds.includes(itemId)
              return (
                <div
                  key={itemId}
                  onClick={() => toggleReceiptItem(itemId)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    isChecked
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/60 hover:bg-secondary/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleReceiptItem(itemId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Receipt #{itemId}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Calendar size={11} className="text-muted-foreground" />
                        {item.payment_date
                          ? new Date(item.payment_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                        &bull;
                        <span className="uppercase">{item.payment_method || 'Cash'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-500">
                      +₹{Number(item.amount_paid || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              {selectedReceiptIds.length} of {paymentHistoryList.length} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={generatingPdf}
                onClick={() => setReceiptModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={selectedReceiptIds.length === 0 || generatingPdf}
                onClick={handlePrintReceipt}
                className="gap-1.5"
              >
                <Printer size={13} />
                Preview / Print
              </Button>
              <Button
                size="sm"
                type="button"
                disabled={selectedReceiptIds.length === 0 || generatingPdf}
                onClick={handleDownloadReceipt}
                className="gap-1.5 bg-primary hover:bg-[#1f6feb] text-primary-foreground font-medium"
              >
                {generatingPdf ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
