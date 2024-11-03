'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './stocks/message'
import { fetchRelevantDocs } from '@/app/actions'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { RelevantDoc } from '@/lib/types'

export function PromptForm({
  input,
  setInput,
  setRelevantDocs // Add setRelevantDocs prop
}: {
  input: string
  setInput: (value: string) => void
  setRelevantDocs: React.Dispatch<React.SetStateAction<RelevantDoc[]>>
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [placeholder, setPlaceholder] = React.useState(
    'Zeptej se na právní otázku.'
  )
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  React.useEffect(() => {
    if (!isLoading) return

    const cyclingMessages = [
      'Hledám relevantní zákony...',
      'Pročítám paragrafy...',
      'Sestavuji odpověď...',
      'Kontroluji správnost odpovědi...'
    ]
    let index = 0
    setPlaceholder(cyclingMessages[0])

    const interval = setInterval(() => {
      index = (index + 1) % cyclingMessages.length
      setPlaceholder(cyclingMessages[index])
    }, 2000)

    // Cleanup function
    return () => {
      clearInterval(interval)
      setPlaceholder('Zeptej se na právní otázku.')
    }
  }, [isLoading])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    // Blur focus on mobile
    if (window.innerWidth < 600) {
      e.target['message']?.blur()
    }

    const value = input.trim()
    setInput('')
    if (!value) return

    setIsLoading(true)
    try {
      // Optimistically add user message UI
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{value}</UserMessage>
        }
      ])

      // Submit and get response message
      const responseMessage = await submitUserMessage(value)

      // Update relevant documents state on the client side
      setRelevantDocs(responseMessage.relevantDocs)
      setMessages(currentMessages => [...currentMessages, responseMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
              onClick={() => {
                router.push('/new')
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm ${
            isLoading
              ? 'animate-placeholder-pulse placeholder:text-muted-foreground/70'
              : 'placeholder:text-muted-foreground/50'
          }`}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
