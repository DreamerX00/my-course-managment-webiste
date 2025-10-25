"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Grid3X3, 
  Filter, 
  TrendingUp,
  Monitor
} from "lucide-react"

interface LayoutOptions {
  gridColumns: number
  showFiltersSidebar: boolean
  showSortingDropdown: boolean
  showTrendingSection: boolean
  showRecentlyAdded: boolean
}

interface LayoutTogglePanelProps {
  options: LayoutOptions
  onUpdate: (options: LayoutOptions) => void
}

export function LayoutTogglePanel({ options, onUpdate }: LayoutTogglePanelProps) {
  const updateOption = (key: keyof LayoutOptions, value: number | boolean) => {
    onUpdate({ ...options, [key]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Explore Page Layout Options
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure how the explore courses page is displayed to users.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grid Layout */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
              <Label className="text-base font-medium">Grid Layout</Label>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="gridColumns" className="text-sm text-gray-600">
                Number of columns:
              </Label>
              <Select
                value={options.gridColumns.toString()}
                onValueChange={(value) => updateOption('gridColumns', parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                {[2, 3, 4].map((cols) => (
                  <div
                    key={cols}
                    className={`p-2 border rounded cursor-pointer transition-all ${
                      options.gridColumns === cols
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateOption('gridColumns', cols)}
                  >
                    <div className={`grid gap-1 ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                      {Array.from({ length: cols * 2 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded transition-colors ${
                            options.gridColumns === cols ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Live Grid Preview */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium mb-3 block">Live Grid Preview:</Label>
              <div className={`grid gap-3 ${options.gridColumns === 2 ? 'grid-cols-2' : options.gridColumns === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {Array.from({ length: options.gridColumns * 2 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">Course {i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shows {options.gridColumns} columns with {options.gridColumns * 2} sample courses
              </p>
            </div>
          </div>

          {/* Filter Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              <Label className="text-base font-medium">Filter Options</Label>
            </div>
            
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showFiltersSidebar" className="text-sm font-medium">
                    Show Filters Sidebar
                  </Label>
                  <p className="text-xs text-gray-500">
                    Display category and price filters on the left side
                  </p>
                </div>
                <Switch
                  id="showFiltersSidebar"
                  checked={options.showFiltersSidebar}
                  onCheckedChange={(checked) => updateOption('showFiltersSidebar', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showSortingDropdown" className="text-sm font-medium">
                    Show Sorting Dropdown
                  </Label>
                  <p className="text-xs text-gray-500">
                    Allow users to sort by price, rating, popularity, etc.
                  </p>
                </div>
                <Switch
                  id="showSortingDropdown"
                  checked={options.showSortingDropdown}
                  onCheckedChange={(checked) => updateOption('showSortingDropdown', checked)}
                />
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <Label className="text-base font-medium">Additional Sections</Label>
            </div>
            
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showTrendingSection" className="text-sm font-medium">
                    Show Trending Courses
                  </Label>
                  <p className="text-xs text-gray-500">
                    Display a section with trending/popular courses
                  </p>
                </div>
                <Switch
                  id="showTrendingSection"
                  checked={options.showTrendingSection}
                  onCheckedChange={(checked) => updateOption('showTrendingSection', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showRecentlyAdded" className="text-sm font-medium">
                    Show Recently Added
                  </Label>
                  <p className="text-xs text-gray-500">
                    Display a section with newly added courses
                  </p>
                </div>
                <Switch
                  id="showRecentlyAdded"
                  checked={options.showRecentlyAdded}
                  onCheckedChange={(checked) => updateOption('showRecentlyAdded', checked)}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Layout Preview</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Grid: {options.gridColumns} columns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${options.showFiltersSidebar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Filters Sidebar: {options.showFiltersSidebar ? 'Visible' : 'Hidden'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${options.showSortingDropdown ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Sorting: {options.showSortingDropdown ? 'Available' : 'Hidden'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${options.showTrendingSection ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                <span>Trending Section: {options.showTrendingSection ? 'Visible' : 'Hidden'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${options.showRecentlyAdded ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                <span>Recently Added: {options.showRecentlyAdded ? 'Visible' : 'Hidden'}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Layout Configuration Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 3-column grid works best for most screen sizes</li>
              <li>• Filters sidebar helps users find specific courses</li>
              <li>• Trending and recently added sections increase engagement</li>
              <li>• Changes apply immediately to the explore page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 