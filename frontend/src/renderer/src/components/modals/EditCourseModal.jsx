import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, IndianRupee, Clock, Loader2, AlertCircle, Save, FileText } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL

const EditCourseModal = ({ open, onOpenChange, course, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalFee: '',
    duration: '',
    description: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        totalFee: course.total_fee !== undefined ? String(course.total_fee) : '',
        duration: course.duration || '',
        description: course.description || '',
        isActive: course.is_active !== undefined ? Boolean(course.is_active) : true,
      })
      setError('')
    }
  }, [course, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please provide a course title.')
      return
    }

    if (
      formData.totalFee === '' ||
      isNaN(Number(formData.totalFee)) ||
      Number(formData.totalFee) < 0
    ) {
      setError('Please provide a valid tuition fee amount in rupees.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.put(`${API_BASE}/course/${course.id}`, {
        name: formData.name.trim(),
        totalFee: Number(formData.totalFee),
        duration: formData.duration.trim() || null,
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      })

      toast.success(res.data?.message || 'Course updated successfully!')
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to update course:', err)
      setError(err?.response?.data?.message || 'Failed to update course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-border bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 pb-5 border-b border-border/70">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Edit Course #{course?.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update course title, fees, duration, and status.
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
            <Label htmlFor="editCourseName" className="text-xs font-medium text-foreground">
              Course Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editCourseName"
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
              <Label htmlFor="editCourseFee" className="text-xs font-medium text-foreground">
                Tuition Fee (₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IndianRupee
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="editCourseFee"
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
              <Label htmlFor="editCourseDuration" className="text-xs font-medium text-foreground">
                Duration
              </Label>
              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="editCourseDuration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 Months"
                  className="pl-8 h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="editCourseDesc" className="text-xs font-medium text-foreground">
              Description
            </Label>
            <div className="relative">
              <Input
                id="editCourseDesc"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief course overview..."
                className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-1 flex items-center gap-2.5">
            <Checkbox
              id="editCourseActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: Boolean(checked) }))
              }
            />
            <Label htmlFor="editCourseActive" className="text-xs cursor-pointer select-none">
              Course is Active & Available for Enrollment
            </Label>
          </div>

          {/* Footer Actions */}
          <div className="-mx-6 -mb-6 mt-6 px-6 py-3.5 bg-muted/30 border-t border-border flex items-center justify-end gap-2.5 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => onOpenChange(false)}
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditCourseModal

