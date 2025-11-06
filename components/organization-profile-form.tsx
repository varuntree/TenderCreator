'use client'

import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/loading-spinner'
import { Organization } from '@/types/organization'

interface OrganizationProfileFormProps {
  organization: Organization
}

export default function OrganizationProfileForm({
  organization,
}: OrganizationProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(organization.name)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    organization.settings?.logo_url || null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Only PNG and JPG images are allowed')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    setLogoFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Update name if changed
      if (name !== organization.name) {
        const response = await fetch('/api/organizations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to update organization name')
        }
      }

      // Upload logo if selected
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)

        const response = await fetch('/api/organizations/logo', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload logo')
        }
      }

      // Refresh the page to show updated data
      router.refresh()
      alert('Organization profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-6">
        {/* Logo Preview */}
        <div className="flex-shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Organization logo"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Organization Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleLogoChange}
            />
            <p className="text-sm text-gray-500">
              PNG or JPG, max 2MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2 text-primary-foreground" />
            Updating...
          </>
        ) : (
          'Update Profile'
        )}
      </Button>
    </form>
  )
}
