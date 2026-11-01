import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function AddStudent() {
    const navigate = useNavigate()
    const API_BASE = import.meta.env.VITE_API_URL

    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [courses, setCourses] = useState([])
    const [courseName, setCourseName] = useState('')
    const [error, setError] = useState('')
    const [selectedCourses, setSelectedCourses] = useState([])
    const [showDiscountTab, setShowDiscountTab] = useState(false)
    const [discount, setDiscount] = useState('')



    const [regNo, setRegNo] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [fName, setFName] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [isRegistered, setIsRegistered] = useState(false)
    const [paymentMode, setPaymentMode] = useState('full-payment')
    const [paymentType, setPaymentType] = useState('upi')
    const [amountPaid, setAmountPaid] = useState('')
    const courseDropdownRef = useRef(null)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${API_BASE}/course`)
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data?.courses || res.data?.data || []
                setCourses(data)
            } catch (err) {
                console.error('Error fetching courses:', err)
            }
        }
        fetchCourses()
    }, [API_BASE])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelectedCourses = (course) => {
        setSelectedCourses((prev) => {
            if (prev.some((item) => item.id === course.id)) return prev
            return [...prev, course]
        })
        setCourseName("")
        setShowSuggestions(false)
    }
    const removeSelectedCourse = (course) => {
        setSelectedCourses((prev) => prev.filter((item) => item.id !== course.id))
    }
    // Total fee calculated from all selected courses
    const totalFee = selectedCourses.reduce((sum, course) => {
        const fee = Number(course.total_fee ?? course.totalFee ?? 0)
        return sum + fee
    }, 0)

    // Ensure discount does not exceed totalFee if courses are removed
    useEffect(() => {
        if (Number(discount) > totalFee) {
            setDiscount(totalFee > 0 ? totalFee : '')
        }
    }, [totalFee])

    const handleDiscountChange = (e) => {
        const val = e.target.value
        if (val === '') {
            setDiscount('')
            return
        }
        const num = Number(val)
        if (num < 0) {
            setDiscount(0)
        } else if (num > totalFee) {
            // Cap discount to total amount
            setDiscount(totalFee)
        } else {
            setDiscount(num)
        }
    }

    const numericDiscount = Math.min(Number(discount) || 0, totalFee)
    const finalAmount = Math.max(0, totalFee - numericDiscount)
    const filteredCourses = (Array.isArray(courses) ? courses : []).filter((course) => {
        const name = course.name || course.courseName || ''
        return name.toLowerCase().includes(courseName.trim().toLowerCase())
    })
    const addStudent = async (e) => {
        if (e) e.preventDefault()
        setError('')
        setLoading(true)

        const studentData = {
            name,
            phone,
            f_name: fName,
            address,
            email,
            regNo,
        }

        try {
            const response = await axios.post(`${API_BASE}/student`, studentData)
            console.log('Student added:', response.data)
            toast.success(response.data?.message || `Student ${name} added successfully!`)
            setIsRegistered(true)
            // navigate('/students')
        } catch (err) {
            console.error('Error adding student:', err)
            const errMsg = err?.response?.data?.message || 'Failed to add student. Please try again.'
            setError(errMsg)
            toast.error(errMsg)
        } finally {
            setLoading(false)
        }
    }
    const enrollStudent = async (e) => {
        e.preventDefault()

        if (!regNo) {
            toast.error("Please add the student Registration Number")
            return;
        }

        if (selectedCourses.length === 0) {
            toast.error("Please select atleast one course")
            return
        }
        const paid = paymentMode === 'full-payment'
            ? finalAmount
            : Number(amountPaid) || 0

        if (paymentMode === 'installment') {
            if (paid <= 0) {
                toast.error("Please enter an initial payment amount greater than ₹0")
                return
            }
            if (paid > finalAmount) {
                toast.error(`Initial payment cannot exceed the total payable amount of ₹${finalAmount}`)
                return
            }
        }

        setLoading(true)
        setError('')
        const enrollmentData = {
            reg_no: regNo,
            course_ids: selectedCourses.map((c) => c.id),
            discount: numericDiscount,
            payment_mode: paymentMode,
            payment_type: paymentType,
            amount_paid: paid,
        }
        try {
            const response = await axios.post(`${API_BASE}/enrollment`, enrollmentData)
            toast.success("Student enrolled in course successfully")
            navigate("/students")
        } catch (error) {
            console.log(error)
            toast.error("Failed to enroll student")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="flex flex-col justify-center items-center py-4">
            <Card className="w-full max-w-[920px] rounded-xl border border-border bg-card shadow-sm">
                <CardHeader className="p-6 pb-4 border-b border-border/60">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                                Add Student
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                Enter student details below to register a new student
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/students')}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {error && (
                        <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
                            {error}
                        </div>
                    )}

                    <form onSubmit={addStudent} className="space-y-5">
                        {/* Two-Column Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                            {/* Row 1: Register Number and Student Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="registerNumber" className="text-xs font-medium text-foreground">
                                    Register Number
                                </Label>
                                <Input
                                    id="registerNumber"
                                    name="registerNumber"
                                    placeholder="REG12345"
                                    required
                                    value={regNo}
                                    onChange={(e) => setRegNo(e.target.value)}
                                    className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="studentName" className="text-xs font-medium text-foreground">
                                    Student Name
                                </Label>
                                <Input
                                    id="studentName"
                                    name="studentName"
                                    placeholder="John Doe"
                                    required
                                    className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Row 2: Phone and Father Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Contact Number"
                                    required
                                    className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="fatherName" className="text-xs font-medium text-foreground">
                                    Father Name
                                </Label>
                                <Input
                                    id="fatherName"
                                    name="fatherName"
                                    placeholder="Father Name"
                                    required
                                    className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                    value={fName}
                                    onChange={(e) => setFName(e.target.value)}
                                />
                            </div>

                            {/* Full-width: Address */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="address" className="text-xs font-medium text-foreground">
                                    Address
                                </Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter address..."
                                    required
                                    className="min-h-[80px] resize-y rounded-md border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            {/* Full-width: Email */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="abcd@gmail.com"
                                    required
                                    className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Full-width Blue Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-9 rounded-md bg-primary hover:bg-[#1f6feb] text-primary-foreground text-sm font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin mr-1.5" />
                                        Adding Student...
                                    </>
                                ) : (
                                    'Add Student'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="w-full max-w-[920px] mt-10 rounded-xl border border-border bg-card shadow-sm">
                {/* Card Header with aligned Back action */}
                <CardHeader className="p-6 pb-4 border-b border-border/60">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                                Course Details
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                Enter student details below to register a new student
                            </CardDescription>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="registerNumber" className="text-xs font-medium text-foreground">
                                Register Number
                            </Label>
                            <Input
                                id="registerNumber"
                                name="registerNumber"
                                placeholder="REG12345"
                                required
                                className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                value={isRegistered ? regNo : ""}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {error && (
                        <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
                            {error}
                        </div>
                    )}

                    <form onSubmit={enrollStudent} className="space-y-5">
                        {/* Two-Column Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                            {/* Row 1: Register Number and Student Name */}
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
                                    // required
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
                                                    onClick={() => {
                                                        // setCourseName(course.name || course.courseName || '')
                                                        setShowSuggestions(false)
                                                        handleSelectedCourses(course)
                                                    }}
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

                            <div className="space-y-1.5">
                                <Label htmlFor="studentName" className="text-xs font-medium text-foreground">
                                    Selected Courses
                                </Label>
                                <div className='flex items-center gap-2'>
                                    {selectedCourses.length > 0 ? selectedCourses.map((course) => (
                                        <Badge key={course.id} variant="secondary" className="cursor-pointer transition-colors hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeSelectedCourse(course)}>{course.name}</Badge>
                                    )) : <div className="text-xs text-muted-foreground">No Course Selected</div>}
                                </div>
                            </div>
                            <div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="registerNumber" className="text-md font-medium text-foreground">
                                        Select Payment Mode
                                    </Label>
                                    <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value="full-payment" id="full-payment" />
                                            <Label htmlFor='full-payment'>Full Payment</Label>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value="installment" id="installment" />
                                            <Label htmlFor='installment'>Installment</Label>
                                        </div>
                                    </RadioGroup>

                                    {paymentMode === 'installment' && (
                                        <div className="space-y-1 pt-2">
                                            <Label htmlFor="amountPaid" className="text-xs font-medium text-foreground">
                                                Initial Amount Paid
                                            </Label>
                                            <Input
                                                id="amountPaid"
                                                name="amountPaid"
                                                type="number"
                                                min="1"
                                                max={finalAmount}
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
                                                    } else if (num > finalAmount) {
                                                        setAmountPaid(finalAmount)
                                                    } else {
                                                        setAmountPaid(num)
                                                    }
                                                }}
                                                className="h-9 w-full sm:w-48 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5 mt-5">
                                    <Label htmlFor="registerNumber" className="text-md mb-2 font-medium text-foreground">
                                        Select Payment Type
                                    </Label>
                                    <RadioGroup value={paymentType} onValueChange={setPaymentType} className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value="upi" id="upi" />
                                            <Label htmlFor='upi'>UPI</Label>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value="card" id="card" />
                                            <Label htmlFor='card'>Card</Label>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <RadioGroupItem value="cash" id="cash" />
                                            <Label htmlFor='cash'>Cash</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className='flex flex-col items-end gap-3'>
                                {!showDiscountTab && (
                                    <h1
                                        className='font-medium text-primary cursor-pointer text-md hover:underline'
                                        onClick={() => setShowDiscountTab(true)}
                                    >
                                        + Add Discount
                                    </h1>
                                )}
                                {showDiscountTab && (
                                    <div className='flex gap-2 items-center'>
                                        <Input
                                            id="discount"
                                            name="discount"
                                            type="number"
                                            min="0"
                                            max={totalFee}
                                            placeholder="Enter discount"
                                            value={discount}
                                            onChange={handleDiscountChange}
                                            className="h-9 w-36 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                                        />
                                        <Button
                                            type="button"
                                            className='h-9 rounded-md bg-destructive hover:bg-destructive/80 text-destructive-foreground text-sm font-medium transition-colors shadow-xs cursor-pointer'
                                            onClick={() => {
                                                setShowDiscountTab(false)
                                                setDiscount('')
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                                <h2 className='font-medium text-gray-500 text-sm'>
                                    Total Course Fee : ₹{totalFee.toLocaleString('en-IN')}
                                </h2>
                                {showDiscountTab && numericDiscount > 0 && (
                                    <h2 className='font-medium text-emerald-600 text-sm'>
                                        Discount : -₹{numericDiscount.toLocaleString('en-IN')}
                                    </h2>
                                )}
                                <h3 className='font-semibold text-primary text-lg'>
                                    Final Amount : ₹{finalAmount.toLocaleString('en-IN')}
                                </h3>
                                {paymentMode === 'installment' && Number(amountPaid) > 0 && (
                                    <>
                                        <h4 className='font-medium text-emerald-600 text-sm'>
                                            Paid Now : ₹{Number(amountPaid).toLocaleString('en-IN')}
                                        </h4>
                                        <h4 className='font-medium text-amber-600 text-sm'>
                                            Remaining Due : ₹{Math.max(0, finalAmount - Number(amountPaid)).toLocaleString('en-IN')}
                                        </h4>
                                    </>
                                )}
                            </div>

                        </div>

                        {/* Full-width Blue Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={loading || !isRegistered}
                                className="w-full h-9 rounded-md bg-primary hover:bg-[#1f6feb] text-primary-foreground text-sm font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin mr-1.5" />
                                        Enrolling Student...
                                    </>
                                ) : (
                                    'Complete Enrollment'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
