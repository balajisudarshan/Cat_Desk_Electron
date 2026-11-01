import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppSidebar from './components/AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import Dashboard from './pages/Dashboard'
import ListStudents from './pages/ListStudents'
import AddStudent from './pages/AddStudent'
import Courses from './pages/Courses'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Batches from './pages/Batches'
import ViewStudent from './pages/ViewStudent'
const getPageTitle = (pathname) => {
  if (pathname.startsWith('/students/') && pathname !== '/students/add') {
    return 'Student Profile'
  }
  switch (pathname) {
    case '/':
      return 'Dashboard'
    case '/students':
      return 'Students Directory'
    case '/students/add':
      return 'Add Student'
    case '/courses':
      return 'Courses'
    case '/batches':
      return 'Batches'
    case '/payments':
      return 'Payments & Invoices'
    case '/reports':
      return 'Reports & Analytics'
    case '/settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}

const AppContent = () => {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <SidebarInset className="min-h-screen bg-background text-foreground flex-1 flex flex-col">
      {/* Standardized Header */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-md px-6">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md p-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="h-4 w-px bg-border mx-1" />
        <h1 className="text-sm font-semibold text-foreground tracking-tight">{pageTitle}</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-6 flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<ListStudents />} />
          <Route path="/students/add" element={<AddStudent />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/students/:id" element={<ViewStudent />} />
        </Routes>
      </main>
    </SidebarInset>
  )
}

const App = () => {
  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      <AppSidebar />
      <AppContent />
    </SidebarProvider>
  )
}

export default App