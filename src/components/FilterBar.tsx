"use client"

import { useState } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterBarProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedPriceType: string
  onPriceTypeChange: (priceType: string) => void
  selectedSort: string
  onSortChange: (sort: string) => void
  className?: string
  showSidebar?: boolean
  showSorting?: boolean
  colorMap?: Record<string, string>
  loading?: boolean
}

export function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedPriceType,
  onPriceTypeChange,
  selectedSort,
  onSortChange,
  className = "",
  showSidebar = true,
  showSorting = true,
  colorMap = {},
  loading = false
}: FilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  if (!showSidebar) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Desktop Filters */}
      <div className="hidden md:block">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant={selectedCategory === "all" ? "default" : "secondary"}
            className={`cursor-pointer hover:bg-blue-100 ${
              selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onCategoryChange("all")}
            style={{ backgroundColor: selectedCategory === "all" ? undefined : undefined }}
          >
            All Courses
          </Badge>
          {loading ? (
            <span className="text-gray-400 text-sm ml-2">Loading categories...</span>
          ) : categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className={`cursor-pointer hover:bg-blue-100 ${
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => onCategoryChange(category)}
              style={colorMap[category] ? { backgroundColor: colorMap[category], color: '#fff' } : {}}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Price and Sort Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Price:</span>
            <Select value={selectedPriceType} onValueChange={onPriceTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showSorting && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <Select value={selectedSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
        </Button>

        {showMobileFilters && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Category Tabs */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "secondary"}
                  className={`cursor-pointer hover:bg-blue-100 ${
                    selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => onCategoryChange("all")}
                >
                  All Courses
                </Badge>
                {loading ? (
                  <span className="text-gray-400 text-sm ml-2">Loading...</span>
                ) : categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer hover:bg-blue-100 ${
                      selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => onCategoryChange(category)}
                    style={colorMap[category] ? { backgroundColor: colorMap[category], color: '#fff' } : {}}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price</h3>
              <Select value={selectedPriceType} onValueChange={onPriceTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            {showSorting && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sort by</h3>
                <Select value={selectedSort} onValueChange={onSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 