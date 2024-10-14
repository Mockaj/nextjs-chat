import 'server-only'

import axios from 'axios';
import {ContextResponse, RelevantDoc} from '@/lib/types';
import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { Events } from '@/components/stocks/events'
import { Stocks } from '@/components/stocks/stocks'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import {Dispatch, SetStateAction} from "react";

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
            amount * price
          }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

export async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  const response = await axios.post<ContextResponse>(
      'http://127.0.0.1:8000/api/v1/context?n=3',
      { query: content },
      {
        auth: {
          username: 'user1',
          password: 'password2'
        }
      }
  )

  const relevantDocsText = response.data.relevant_docs
      .map(doc => `§ ${doc.paragraph_cislo} zákona č. ${doc.law_id}/${doc.law_year} Sb.\n- ${doc.paragraph_zneni}\n`)
      .join('\n')

  const prompt = `
    Context:
    ${relevantDocsText}

    Question:
    ${content}
  `

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  // Variable to accumulate the assistant's response content
  let assistantContent = ''
  let usedDocs: RelevantDoc[] = []

  // Promise that resolves when streaming is complete
  const streamComplete = new Promise<void>((resolve) => {
    streamUI({
      model: openai('gpt-4o-mini'),
      initial: <SpinnerMessage />,
      system: `\
         You are a legal assistant for Czech law context. Use the given context to provide accurate answers.
         Answer strictly in Czech language. You need to source each piece of information in your answers as follows:
        "§ {paragraph_cislo} zákona č. {law_id}/{law_year} Sb.`,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        })),
        {
          role: 'user',
          content: prompt // Using the prompt with enriched context
        }
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }

        if (delta) {
          assistantContent += delta // Accumulate the assistant's response
          textStream.update(delta)
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: assistantContent // Use the full accumulated content
              }
            ]
          })

          // Now that the assistant's response is complete, check for references
          for (const doc of response.data.relevant_docs) {
            // Create a regex pattern allowing up to 20 characters between the paragraph number and the law reference
            const pattern = new RegExp(
                `§\\s*${doc.paragraph_cislo}.{0,20}?zákona\\s+č\\.\\s*${doc.law_id}\\/${doc.law_year}`,
                'i'
            )

            if (pattern.test(assistantContent)) {
              // Ensure no duplicates
              if (
                  !usedDocs.some(
                      d =>
                          d.paragraph_cislo === doc.paragraph_cislo &&
                          d.law_id === doc.law_id &&
                          d.law_year === doc.law_year
                  )
              ) {
                usedDocs.push(doc)
              }
            }
          }
          console.log('relevant', response.data.relevant_docs)
          console.log('usedDocs', usedDocs)

          resolve() // Resolve the promise when streaming is done
        }

        return textNode
      },
      tools: {
        // Define tools and handlers here if required
      }
    })
  })

  // Wait for the streaming to complete
  await streamComplete

  return {
    id: nanoid(),
    display: textNode,
    relevantDocs: usedDocs
  }
}
export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state, done }) => {
    'use server'

    if (!done) return

    const session = await auth()
    if (!session || !session.user) return

    const { chatId, messages } = state

    const createdAt = new Date()
    const userId = session.user.id as string
    const path = `/chat/${chatId}`

    const firstMessageContent = messages[0].content as string
    const title = firstMessageContent.substring(0, 100)

    const chat: Chat = {
      id: chatId,
      title,
      userId,
      createdAt,
      messages,
      path
    }

    await saveChat(chat)
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPrice' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPurchase' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
