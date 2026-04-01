import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Link } from '@/shared/link'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Form from 'next/form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return {
    title: t('metaForgotTitle'),
    description: t('metaForgotDescription'),
  }
}

const PageForgotPass = async () => {
  const t = await getTranslations('Auth')
  const tc = await getTranslations('Common')

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const formObject = Object.fromEntries(formData.entries())
    console.log(formObject)
  }

  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl leading-[1.15] font-semibold text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          {t('forgotPasswordTitle')}
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          {t('forgotPasswordHint')}
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">
        <Form action={handleSubmit}>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>{t('emailAddress')}</Label>
                <Input type="email" name="email" placeholder={t('emailPlaceholder')} />
              </Field>
              <ButtonPrimary className="w-full" type="submit">
                {tc('continue')}
              </ButtonPrimary>
            </FieldGroup>
          </Fieldset>
        </Form>

        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          {t('goBackFor')}{` `}
          <Link href="/login" className="text-primary-600 underline">
            {t('signIn')}
          </Link>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
          <Link href="/signup" className="text-primary-600 underline">
            {t('signupTitle')}
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageForgotPass
