import facebookSvg from '@/images/socials/facebook-2.svg'
import googleSvg from '@/images/socials/google.svg'
import twitterSvg from '@/images/socials/twitter.svg'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Link } from '@/shared/link'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Form from 'next/form'
import Image from 'next/image'

const loginSocials = [
  { nameKey: 'continueWithFacebook' as const, href: '#', icon: facebookSvg },
  { nameKey: 'continueWithTwitter' as const, href: '#', icon: twitterSvg },
  { nameKey: 'continueWithGoogle' as const, href: '#', icon: googleSvg },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return {
    title: t('metaSignupTitle'),
    description: t('metaSignupDescription'),
  }
}

const PageSignUp = async () => {
  const t = await getTranslations('Auth')

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const formObject = Object.fromEntries(formData.entries())
    console.log(formObject)
  }

  return (
    <div className="container mb-24 lg:mb-32">
      <h1 className="my-20 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
        {t('signupTitle')}
      </h1>
      <div className="mx-auto max-w-md space-y-6">
        <div className="grid gap-3">
          {loginSocials.map((item, index) => {
            const label = t(item.nameKey)
            return (
              <a
                key={index}
                href={item.href}
                className="flex w-full transform rounded-lg bg-primary-50 px-4 py-3 transition-transform hover:translate-y-[-2px] sm:px-6 dark:bg-neutral-800"
              >
                <Image sizes="40px" className="size-5 shrink-0 object-cover" src={item.icon} alt={label} />
                <h3 className="grow text-center text-sm font-medium text-neutral-700 sm:text-sm dark:text-neutral-300">
                  {label}
                </h3>
              </a>
            )
          })}
        </div>
        <div className="relative text-center">
          <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium dark:bg-neutral-900 dark:text-neutral-400">
            {t('orDivider')}
          </span>
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 transform border border-neutral-100 dark:border-neutral-800"></div>
        </div>
        <Form action={handleSubmit}>
          <Fieldset>
            <FieldGroup className="sm:space-y-6">
              <Field>
                <Label>{t('email')}</Label>
                <Input type="email" name="email" placeholder={t('emailPlaceholder')} />
              </Field>
              <Field>
                <Label>{t('password')}</Label>
                <Input type="password" name="password" />
              </Field>

              <ButtonPrimary className="mt-2 w-full" type="submit">
                {t('signupBtn')}
              </ButtonPrimary>
            </FieldGroup>
          </Fieldset>
        </Form>

        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          {t('hasAccount')}{` `}
          <Link className="text-primary-600 underline" href="/login">
            {t('signIn')}
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageSignUp
