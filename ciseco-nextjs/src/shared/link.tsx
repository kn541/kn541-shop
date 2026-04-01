'use client'

import { useAside } from '@/components/aside'
import { Link as NextIntlLink } from '@/i18n/navigation'
import * as Headless from '@headlessui/react'
import React, { ComponentProps, forwardRef } from 'react'

export type AppLinkProps = ComponentProps<typeof NextIntlLink> & React.ComponentPropsWithoutRef<'a'>

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(props, ref) {
  const closeHeadless = Headless.useClose()
  const aside = useAside()

  return (
    <Headless.DataInteractive>
      <NextIntlLink
        {...props}
        ref={ref}
        onClick={(e) => {
          if (props.onClick) {
            props.onClick(e)
          }
          closeHeadless()
          aside.close()
        }}
      />
    </Headless.DataInteractive>
  )
})
