import { SeedLawForm } from '@/components/seed-law-form'

export default function LawPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-background p-8">
        <h1 className="text-2xl font-bold mb-6">Přidat zákon</h1>
        <p className="text-zinc-500 mb-8">
          Přidejte URL zákona z zakonyprolidi.cz, abyste ho přidali do databáze.
        </p>
        <SeedLawForm />
      </div>
    </div>
  )
}
