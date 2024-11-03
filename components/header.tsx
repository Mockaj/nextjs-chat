import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image' // Optional: Only if you decide to use the Image component elsewhere

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { IconSeparator, IconNextChat } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { Session } from '@/lib/types'

interface UserOrLoginProps {
  session: Session | null
}

async function UserOrLogin() {
  const session = (await auth()) as Session | null
  return (
    <>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/new" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      {/* Left Section: User or Login */}
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      {/* Center Section: ADVOKÁTEK Heading */}
      <div className="flex items-center justify-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent tracking-widest">
              ADVOKÁTEK
            </span>
          </h1>
        </Link>
      </div>
    </header>
  )
}
