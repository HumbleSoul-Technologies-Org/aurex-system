'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UploadDocumentForm from '@/components/forms/upload-document-form'
import {
  Plus,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  FileText,
  Folder as FolderIcon,
  MoreVertical,
  Eye,
  Share2,
  Clock,
  CheckCircle,
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'lease' | 'inspection' | 'insurance' | 'tax' | 'other'
  property: string
  uploadedDate: string
  expiryDate?: string
  size: string
}

interface Folder {
  name: string
  items: number
  path: string
}

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)

  const folders: Folder[] = [
    { name: 'Sunset Apartments', items: 12, path: 'properties/sunset' },
    { name: 'Downtown Office', items: 8, path: 'properties/downtown' },
    { name: 'Beachside Villa', items: 5, path: 'properties/beachside' },
    { name: 'Mountain Lodge', items: 6, path: 'properties/mountain' },
    { name: 'Urban Lofts', items: 9, path: 'properties/urban' },
    { name: 'Tax Documents', items: 15, path: 'taxes' },
    { name: 'Insurance', items: 10, path: 'insurance' },
    { name: 'Legal', items: 7, path: 'legal' },
  ]

  const documents: Document[] = [
    {
      id: '1',
      name: 'Lease Agreement - John Smith.pdf',
      type: 'lease',
      property: 'Sunset Apartments',
      uploadedDate: '2023-01-15',
      expiryDate: '2025-01-14',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Property Inspection Report.pdf',
      type: 'inspection',
      property: 'Downtown Office',
      uploadedDate: '2024-01-10',
      size: '5.1 MB',
    },
    {
      id: '3',
      name: 'Insurance Certificate 2024.pdf',
      type: 'insurance',
      property: 'All Properties',
      uploadedDate: '2024-01-01',
      expiryDate: '2024-12-31',
      size: '1.8 MB',
    },
    {
      id: '4',
      name: '2023 Tax Summary.pdf',
      type: 'tax',
      property: 'All Properties',
      uploadedDate: '2024-02-01',
      size: '3.2 MB',
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lease':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'inspection':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'insurance':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      case 'tax':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  const handleUploadDocument = (data: any) => {
    console.log('New document:', data)
  }

  return (
    <div className="space-y-6">
      <UploadDocumentForm 
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        onSubmit={handleUploadDocument}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Documents</h1>
          <p className="text-muted-foreground">Organize and manage property documents, leases, and certificates</p>
        </div>
        <Button 
          onClick={() => setShowUploadForm(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
            <option value="">All Types</option>
            <option value="lease">Leases</option>
            <option value="inspection">Inspections</option>
            <option value="insurance">Insurance</option>
            <option value="tax">Tax Documents</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
            >
              <FolderIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Folders Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Folders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <Card
              key={folder.path}
              className="border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedFolder(folder.path)}
            >
              <FolderIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-semibold text-foreground text-sm mb-1">{folder.name}</p>
              <p className="text-xs text-muted-foreground">{folder.items} items</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Recent Documents</h2>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <p className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                  {doc.name}
                </p>

                <p className="text-xs text-muted-foreground mb-3">{doc.property}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${getTypeColor(doc.type)}`}>
                    {doc.type}
                  </span>
                </div>

                {doc.expiryDate && (
                  <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                    <p className="text-yellow-900 dark:text-yellow-200 font-semibold mb-1">
                      Expires: {doc.expiryDate}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-border bg-transparent">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-border bg-transparent">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Document</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Property</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Uploaded</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-border hover:bg-secondary transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">{doc.name}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">{doc.property}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${getTypeColor(doc.type)}`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{doc.uploadedDate}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{doc.size}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-border bg-transparent">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-border bg-transparent">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-border bg-transparent">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
