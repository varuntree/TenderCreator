'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, type ReactNode,useState } from 'react'

import { ProcessLoaderOverlay } from '@/components/process-loader-overlay'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'

const initialFormState = {
  name: '',
  client_name: '',
  deadline: '',
  instructions: '',
}

type CreateProjectDialogProps = {
  trigger?: ReactNode
}

const projectSetupSteps = [
  { id: 'workspace', label: 'Creating your project workspace' },
  { id: 'documents', label: 'Uploading tender references' },
  { id: 'indexing', label: 'Indexing compliance requirements' },
  { id: 'outputs', label: 'Preparing your starter checklist' },
]

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormState)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setFormData(initialFormState)
      setError(null)
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error ?? 'Unable to create project')
      }

      handleOpenChange(false)
      router.push(`/projects/${result.data.id}`)
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProcessLoaderOverlay
        isVisible={loading}
        title="Generating the required documents"
        subtitle="We’re setting up your tender workspace and preparing the first checklist."
        steps={projectSetupSteps}
        iconLabel="TC"
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger ?? <Button>Create Project</Button>}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a project workspace so your team can start collaborating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              required
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              value={formData.client_name}
              onChange={(event) => setFormData({ ...formData, client_name: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-deadline">Deadline</Label>
            <Input
              id="project-deadline"
              type="date"
              value={formData.deadline}
              onChange={(event) => setFormData({ ...formData, deadline: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-instructions">Instructions</Label>
            <Textarea
              id="project-instructions"
              rows={4}
              value={formData.instructions}
              onChange={(event) => setFormData({ ...formData, instructions: event.target.value })}
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <LoadingSpinner className="mr-2" />}
              {loading ? 'Creating project...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
