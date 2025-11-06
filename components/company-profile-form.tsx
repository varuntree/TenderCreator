'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CompanyProfile, Organization } from '@/types/organization'

interface CompanyProfileFormProps {
  organization: Organization
  open: boolean
  onClose: () => void
}

export default function CompanyProfileForm({
  organization,
  open,
  onClose,
}: CompanyProfileFormProps) {
  const router = useRouter()
  const existingProfile = organization.settings?.profile

  const [formData, setFormData] = useState<CompanyProfile>({
    company_name: existingProfile?.company_name || organization.name,
    company_description: existingProfile?.company_description || '',
    industry: existingProfile?.industry || '',
    services_offered: existingProfile?.services_offered || [],
    key_projects: existingProfile?.key_projects || '',
    certifications: existingProfile?.certifications || [],
    differentiators: existingProfile?.differentiators || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...organization.settings,
            profile: formData,
          },
        }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to save company profile')
      }

      router.refresh()
      onClose()
      alert('Company profile saved successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingProfile ? 'Edit' : 'Create'} Company Profile
          </DialogTitle>
          <DialogDescription>
            Provide details about your company to help AI generate better tender responses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="required">
              Company Name
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description" className="required">
              Company Description
            </Label>
            <Textarea
              id="company_description"
              value={formData.company_description}
              onChange={(e) =>
                setFormData({ ...formData, company_description: e.target.value })
              }
              placeholder="Describe your company in 3-5 sentences"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="required">
              Industry
            </Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData({ ...formData, industry: value })
              }
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="it">IT & Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services_offered">Services Offered</Label>
            <Textarea
              id="services_offered"
              value={formData.services_offered.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  services_offered: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Enter services separated by commas"
              rows={3}
            />
            <p className="text-sm text-gray-500">
              Separate multiple services with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_projects">Key Projects</Label>
            <Textarea
              id="key_projects"
              value={formData.key_projects}
              onChange={(e) =>
                setFormData({ ...formData, key_projects: e.target.value })
              }
              placeholder="Describe notable projects your company has completed"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={formData.certifications.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  certifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Enter certifications separated by commas"
              rows={2}
            />
            <p className="text-sm text-gray-500">
              Separate multiple certifications with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="differentiators">What Makes You Unique</Label>
            <Textarea
              id="differentiators"
              value={formData.differentiators}
              onChange={(e) =>
                setFormData({ ...formData, differentiators: e.target.value })
              }
              placeholder="What sets your company apart from competitors?"
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2 text-primary-foreground" />
                  Saving...
                </>
              ) : (
                'Save Company Profile'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
