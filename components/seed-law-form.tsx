'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { seedLaw } from '@/app/actions'

export function SeedLawForm() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.startsWith('https://www.zakonyprolidi.cz')) {
      toast.error('Prosím použijte pouze odkazy ze stránky zakonyprolidi.cz')
      return
    }

    setIsLoading(true)

    try {
      const result = await seedLaw(url)
      if (result.success) {
        toast.success(`Úspěšně přidán zákon: ${result.data.nazev}`)
        setUrl('')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Nepodařilo se přidat zákon'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          Zákon URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.zakonyprolidi.cz/cs/2012-90"
          className="w-full rounded-md border bg-zinc-50 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Přidávání...' : 'Přidat zákon'}
      </Button>
    </form>
  )
}
