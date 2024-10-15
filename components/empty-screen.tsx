import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
         Vítejte na Advokátkovi!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Unavuje vás už jak si neustále ChatGPT vymýšlí zákony a cituje neexistující vyhlášky?
          Advokátek je webová aplikace, která ma za cíl přesně tento problém řešit. Funguje stejně jako chatGPT
          s tím rozdílem, že veškeré své odpovědi staví na aktuálně platných zákonech České republiky.
          Zákony, které použivá jsou čerpány z neustále se aktualizující databáze. Své odpovědi navíc poctivě cituje,
          tak jak se sluší a patří. Nezbývá než se přesvědčit na vlastní kůži 🚀
        </p>
      </div>
    </div>
  )
}
