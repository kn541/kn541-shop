'use client'

import { Link as SharedLink, type AppLinkProps } from '@/shared/link'
import React, { forwardRef } from 'react'

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(props, ref) {
  return <SharedLink ref={ref} {...props} />
})

export type { AppLinkProps as LinkProps }
