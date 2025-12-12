'use client'

import { ReCaptchaProvider } from 'next-recaptcha-v3'
import Loader from './loader'

export const Providers = ({ children }: any) => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY ?? ''
  return (
    <Loader>
      <ReCaptchaProvider reCaptchaKey={siteKey}>{children}</ReCaptchaProvider>
    </Loader>
  )
}
