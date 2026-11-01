import React from "react"
import {
    LayoutDashboard,
    Users,
    UserRoundPlus,
    BookOpen,
    CreditCard,
    ChartNoAxesColumn,
    Settings,
    GraduationCap,
    PanelLeft,
    ShieldCheck,
    CalendarRange,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"
import { useLocation, useNavigate } from "react-router-dom"

const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Students", url: "/students", icon: Users },
    { title: "Add Student", url: "/students/add", icon: UserRoundPlus },
    { title: "Courses", url: "/courses", icon: BookOpen },
    { title: "Batches", url: "/batches", icon: CalendarRange },
    { title: "Payments", url: "/payments", icon: CreditCard },
    { title: "Reports", url: "/reports", icon: ChartNoAxesColumn },
    { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
    const { toggleSidebar } = useSidebar()
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-[#30363d] bg-[#010409] text-[#e6edf3] [&>[data-sidebar=sidebar]]:bg-[#010409]"
        >
            {/* Header / Brand */}
            <SidebarHeader className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#2f81f7] text-white shadow-sm ring-1 ring-[#2f81f7]/30">
                        <GraduationCap size={18} />
                    </div>

                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold tracking-tight text-[#f0f6fc]">
                            CampusDesk
                        </span>
                        <span className="text-[11px] text-[#8b949e]">
                            Admin Portal
                        </span>
                    </div>

                    <button
                        onClick={toggleSidebar}
                        className="ml-auto rounded-md p-1.5 text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc] transition-colors focus:outline-none focus:ring-1 focus:ring-[#2f81f7]"
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeft size={16} />
                    </button>
                </div>
            </SidebarHeader>

            <Separator className="bg-[#21262d]" />

            {/* Navigation Menu */}
            <SidebarContent className="px-2 py-3">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7d8590] group-data-[collapsible=icon]:hidden">
                        Navigation
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1 mt-1">
                            {navItems.map((item) => {
                                const active = location.pathname === item.url

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            isActive={active}
                                            tooltip={item.title}
                                            onClick={() => navigate(item.url)}
                                            className={`relative h-9 rounded-md px-3 text-sm transition-all ${active
                                                    ? "!bg-[#21262d] !text-[#f0f6fc] font-medium border border-[#30363d] shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-[#2f81f7]"
                                                    : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]"
                                                }`}
                                        >
                                            <item.icon size={17} className={active ? "text-[#58a6ff]" : "text-[#8b949e]"} />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Admin Profile Footer */}
            <SidebarFooter className="p-3 border-t border-[#21262d]">
                <div className="flex items-center gap-3 rounded-lg border border-[#30363d] bg-[#161b22] p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                    <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#21262d] text-xs font-semibold text-[#f0f6fc] ring-1 ring-[#30363d]">
                        AD
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#3fb950] ring-2 ring-[#161b22]" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-[#f0f6fc]">Admin User</span>
                            <ShieldCheck size={13} className="text-[#58a6ff] shrink-0" />
                        </div>
                        <span className="truncate text-[11px] text-[#8b949e]">admin@campusdesk.edu</span>
                    </div>
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}

export default AppSidebar
