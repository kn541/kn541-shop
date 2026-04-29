import naverBlog from '@/images/socials/naver-blog.svg'
import instagram from '@/images/socials/instagram.svg'
import facebook from '@/images/socials/facebook.svg'
import youtube from '@/images/socials/youtube.svg'
import clsx from 'clsx'
import Image from 'next/image'
import { FC } from 'react'
import { Link } from '../link'

interface SocialsList1Props {
  className?: string
}

const socials = [
  {
    name: '네이버 블로그',
    icon: naverBlog,
    href: 'https://blog.naver.com/kn541_official',
  },
  {
    name: '인스타그램',
    icon: instagram,
    href: 'https://www.instagram.com/kn541_official/',
  },
  {
    name: '페이스북',
    icon: facebook,
    href: 'https://www.facebook.com/profile.php?id=61585469661263',
  },
  {
    name: '유튜브',
    icon: youtube,
    href: 'https://www.youtube.com/@%EC%BC%80%EC%9D%B4%EC%97%94541',
  },
]

const SocialsList1: FC<SocialsList1Props> = ({ className }) => {
  return (
    <div className={clsx('flex flex-col gap-y-3', className)}>
      {socials.map((item, index) => (
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={item.href}
          className="flex items-center gap-x-2 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
          key={index}
        >
          <Image
            sizes="40px"
            className="h-auto w-5 shrink-0"
            width={40}
            height={40}
            src={item.icon}
            alt={item.name}
          />
          <span className="text-sm/6">{item.name}</span>
        </Link>
      ))}
    </div>
  )
}

export default SocialsList1
