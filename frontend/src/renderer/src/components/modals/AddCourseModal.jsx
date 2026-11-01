import React, { useState } from 'react'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, IndianRupee, Clock, Plus, Loader2, AlertCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL

const AddCourseModal = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalFee: '',
    duration: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      totalFee: '',
      duration: '',
    })
    setError('')
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please provide a course name.')
      return
    }

    if (!formData.totalFee || isNaN(formData.totalFee) || Number(formData.totalFee) < 0) {
      setError('Please provide a valid tuition fee amount in rupees.')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/course`, {
        name: formData.name.trim(),
        totalFee: Number(formData.totalFee),
        duration: formData.duration.trim() || null,
      })

      resetForm()
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to create course:', err)
      setError(err?.response?.data?.message || 'Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-border bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 pb-5 border-b border-border/70">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Create New Course
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Define the course title, duration, and tuition fee structure.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Course Name */}
          <div className="space-y-1.5">
            <Label htmlFor="courseName" className="text-xs font-medium text-foreground">
              Course Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="courseName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Full Stack Web Development"
              required
              className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
            />
          </div>

          {/* Two-column Row: Total Fee & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Fee in Rupees */}
            <div className="space-y-1.5">
              <Label htmlFor="courseFee" className="text-xs font-medium text-foreground">
                Tuition Fee (₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IndianRupee
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="courseFee"
                  name="totalFee"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.totalFee}
                  onChange={handleChange}
                  placeholder="15000"
                  required
                  className="pl-8 h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40 font-mono"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="courseDuration" className="text-xs font-medium text-foreground">
                Duration
              </Label>
              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="courseDuration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 Months"
                  className="pl-8 h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="-mx-6 -mb-6 mt-6 px-6 py-3.5 bg-muted/30 border-t border-border flex items-center justify-end gap-2.5 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleOpenChange(false)}
              className="h-9 px-4 text-xs border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 px-4 gap-1.5 bg-primary hover:bg-[#1f6feb] text-primary-foreground text-xs font-medium shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creating Course...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create Course</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCourseModal