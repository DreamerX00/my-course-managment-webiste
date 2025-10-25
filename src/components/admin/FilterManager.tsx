"use client"

import { useState } from "react"
import { motion, Reorder } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Palette,
  Tag
} from "lucide-react"

interface FilterCategory {
  id: string
  name: string
  color: string
  order: number
}

interface FilterManagerProps {
  categories: FilterCategory[]
  onUpdate: (categories: FilterCategory[]) => void
}

const defaultColors = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
]

export function FilterManager({ categories, onUpdate }: FilterManagerProps) {
  const [newCategory, setNewCategory] = useState({ name: "", color: defaultColors[0] })
  const [editingId, setEditingId] = useState<string | null>(null)

  const addCategory = () => {
    if (!newCategory.name.trim()) return

    const newId = `category-${Date.now()}`
    const newOrder = Math.max(...categories.map(c => c.order), 0) + 1
    
    const category: FilterCategory = {
      id: newId,
      name: newCategory.name.trim(),
      color: newCategory.color,
      order: newOrder
    }

    onUpdate([...categories, category])
    setNewCategory({ name: "", color: defaultColors[0] })
  }

  const removeCategory = (id: string) => {
    onUpdate(categories.filter(c => c.id !== id))
  }

  const updateCategory = (id: string, updates: Partial<FilterCategory>) => {
    onUpdate(categories.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
  }

  const handleReorder = (newOrder: FilterCategory[]) => {
    const reordered = newOrder.map((category, index) => ({
      ...category,
      order: index + 1
    }))
    onUpdate(reordered)
  }

  const startEditing = (id: string) => {
    setEditingId(id)
  }

  const stopEditing = () => {
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Filter Categories
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage the categories that appear in the course filter on the explore page.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Category */}
          <div className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Web Development"
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Color</Label>
              <div className="flex gap-1">
                {defaultColors.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newCategory.color === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={addCategory} disabled={!newCategory.name.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Current Categories ({categories.length})
            </Label>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No categories added yet.</p>
                <p className="text-sm">Add your first category above.</p>
              </div>
            ) : (
              <Reorder.Group 
                axis="y" 
                values={categories} 
                onReorder={handleReorder}
                className="space-y-2"
              >
                {categories.map((category) => (
                  <Reorder.Item
                    key={category.id}
                    value={category}
                    className="relative"
                  >
                    <motion.div
                      layout
                      className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                      
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: category.color }}
                      />
                      
                      {editingId === category.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                            onBlur={stopEditing}
                            onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                            className="flex-1"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            {defaultColors.slice(0, 5).map((color) => (
                              <button
                                key={color}
                                onClick={() => updateCategory(category.id, { color })}
                                className={`w-4 h-4 rounded-full border ${
                                  category.color === color 
                                    ? 'border-gray-800' 
                                    : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">#{category.order}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(category.id)}
                            >
                              <Palette className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCategory(category.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag and drop categories to reorder them</li>
              <li>• Click the palette icon to edit category name and color</li>
              <li>• Categories will appear as filter tabs on the explore page</li>
              <li>• Changes are saved automatically when you click &quot;Save Changes&quot;</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 