import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Loader2 } from 'lucide-react'

const Batches = () => {
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div>
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


        </div>
    )
}

export default Batches