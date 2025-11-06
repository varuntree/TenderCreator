'use client'

import { Building2, Edit, Folder, Info, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import CompanyProfileForm from '@/components/company-profile-form'
import DeleteOrganizationDialog from '@/components/delete-organization-dialog'
import OrganizationProfileForm from '@/components/organization-profile-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Organization } from '@/types/organization'

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadOrganization()
  }, [])

  const loadOrganization = async () => {
    try {
      const response = await fetch('/api/organizations')
      const result = await response.json()

      if (result.success) {
        setOrganization(result.data)
      }
    } catch (error) {
      console.error('Error loading organization:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner text="Loading organization..." />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Organization not found</p>
      </div>
    )
  }

  const hasProfile = !!organization.settings?.profile

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4" />
          <span>COMPANY</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Company</h1>
            <p className="text-gray-600">
              Manage your company details like name and logo and then build a company profile that Tender Creator can use as context when generating tenders
            </p>
          </div>
        </div>
      </div>

      {/* Company Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Profile Form */}
          <OrganizationProfileForm organization={organization} />

          {/* Danger Zone */}
          <div className="border-t pt-6">
            <h3 className="mb-4 text-lg font-semibold">Danger Zone</h3>
            <div className="space-y-3">
              {/* Leave Organization */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave organization</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  disabled
                  title="Team features coming soon"
                >
                  Leave organization
                </Button>
              </div>

              {/* Delete Organization */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete organization</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete organization
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <Alert className="border-cyan-200 bg-cyan-50">
            <Info className="h-4 w-4 text-cyan-600" />
            <AlertDescription className="text-cyan-900">
              A Company Profile helps the AI understand your business context. You need to create one before you can make tenders.
            </AlertDescription>
          </Alert>

          {/* Profile Card or Create Button */}
          {hasProfile ? (
            <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Folder className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">
                      {organization.settings.profile?.company_name || organization.name}
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      {organization.settings.profile?.company_description?.substring(0, 120)}
                      {organization.settings.profile?.company_description &&
                        organization.settings.profile.company_description.length > 120 &&
                        '...'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {organization.settings.profile?.industry && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-green-700">
                          {organization.settings.profile.industry}
                        </span>
                      )}
                      {organization.settings.profile?.services_offered
                        ?.slice(0, 3)
                        .map((service, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-green-700"
                          >
                            {service}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                  onClick={() => setProfileDialogOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Company Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
              <Sparkles className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Company Profile Yet</h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                Create a company profile to help AI understand your business and generate better tender responses
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setProfileDialogOpen(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Create Company Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {profileDialogOpen && (
        <CompanyProfileForm
          organization={organization}
          open={profileDialogOpen}
          onClose={() => {
            setProfileDialogOpen(false)
            loadOrganization()
          }}
        />
      )}

      {deleteDialogOpen && (
        <DeleteOrganizationDialog
          organization={organization}
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  )
}
