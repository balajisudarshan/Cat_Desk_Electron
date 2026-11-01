import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Database, Shield, Bell, Save, Check } from 'lucide-react'

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const apiEndpoint = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-1 pb-1 border-b border-border/60">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          System Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure application preferences, institution profile, and API endpoints.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Institution Card */}
        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="p-6 pb-4 border-b border-border/60">
            <CardTitle className="text-base font-semibold text-foreground">
              Institution Profile
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              General identification parameters shown on administrative reports and documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="instName" className="text-xs font-medium text-foreground">
                  Institution Name
                </Label>
                <Input
                  id="instName"
                  defaultValue="CampusDesk Institute of Technology"
                  className="h-9 rounded-md border-border bg-background text-sm text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="academicYear" className="text-xs font-medium text-foreground">
                  Active Academic Term
                </Label>
                <Input
                  id="academicYear"
                  defaultValue="Fall 2026 / Academic Session 1"
                  className="h-9 rounded-md border-border bg-background text-sm text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="contactEmail" className="text-xs font-medium text-foreground">
                  Administrative Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  defaultValue="admin@campusdesk.edu"
                  className="h-9 rounded-md border-border bg-background text-sm text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database & API Card */}
        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Database size={16} className="text-primary" />
                Backend & API Connectivity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Target server endpoint for electron desktop requests.
              </CardDescription>
            </div>
            <Badge variant="success">Connected</Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="apiUrl" className="text-xs font-medium text-foreground">
                API Base URL
              </Label>
              <Input
                id="apiUrl"
                defaultValue={apiEndpoint}
                className="h-9 rounded-md border-border bg-background text-sm font-mono text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-[#3fb950] font-medium">
              <Check size={14} />
              Settings saved successfully!
            </span>
          )}
          <Button
            type="submit"
            className="h-9 gap-1.5 bg-primary hover:bg-[#1f6feb] text-primary-foreground text-xs font-medium px-4 shadow-xs"
          >
            <Save size={14} />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
