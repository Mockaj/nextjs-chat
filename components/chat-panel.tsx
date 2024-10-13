'use client'

import * as React from 'react'
import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'
import { RelevantDoc } from '@/lib/types'
import { PromptForm } from './prompt-form';
import {AI} from "@/lib/chat/actions"; // Import PromptForm here

export interface ChatPanelProps {
    id?: string
    title?: string
    input: string
    setInput: (value: string) => void
    isAtBottom: boolean
    scrollToBottom: () => void
    setRelevantDocs: React.Dispatch<React.SetStateAction<RelevantDoc[]>>
}

export function ChatPanel({
                              id,
                              title,
                              input,
                              setInput,
                              isAtBottom,
                              scrollToBottom,
                              setRelevantDocs
                          }: ChatPanelProps) {
    const [aiState] = useAIState()
    const [messages, setMessages] = useUIState<typeof AI>()
    const { submitUserMessage } = useActions()
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

    const handleMessageSubmit = async (messageContent: string) => {
        const responseMessage = await submitUserMessage(messageContent);

        // Update relevant documents state on the client side
        setRelevantDocs(responseMessage.relevantDocs);

        setMessages((currentMessages) => [...currentMessages, responseMessage]);
    };

    return (
        <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                <PromptForm
                    input={input}
                    setInput={setInput}
                    setRelevantDocs={setRelevantDocs} // Pass setRelevantDocs to PromptForm
                />
                {messages?.length >= 2 ? (
                    <div className="flex h-12 items-center justify-center">
                        <div className="flex space-x-2">
                            {id && title ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShareDialogOpen(true)}
                                    >
                                        <IconShare className="mr-2" />
                                        Share
                                    </Button>
                                    <ChatShareDialog
                                        open={shareDialogOpen}
                                        onOpenChange={setShareDialogOpen}
                                        onCopy={() => setShareDialogOpen(false)}
                                        shareChat={shareChat}
                                        chat={{
                                            id,
                                            title,
                                            messages: aiState.messages
                                        }}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                    <FooterText className="hidden sm:block" />
                </div>
            </div>
        </div>
    )
}