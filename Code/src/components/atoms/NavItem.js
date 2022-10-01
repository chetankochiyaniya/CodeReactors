import PropTypes from 'prop-types'
import Link from 'next/link'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'

export default function NavItem({ title, href, openNewTab }) {
  const { pathname } = useRouter()
  const isActive = pathname === href
  return (
    <Link href={href} key={title} passHref>
      <Button
        component="a"
        target={openNewTab && '_blank'}
        style={{
          fontSize:"18px",
          margin: 'auto 0',
          color: openNewTab ? '#2E7DAF' : 'white',
          background: openNewTab ? '#F2F6FF' : '',
          fontWeight: openNewTab ? 600 : null,
          borderRadius: openNewTab ? '16px' : null,
          padding: openNewTab ? '6px 12px' : null,
          display: 'block',
          textDecoration: isActive && 'underline',
          textAlign: 'center',
          '&:hover': {
            backgroundColor: '#fff',
            color: '#3c52b2'
          }
        }}
      >
        {title}
      </Button>
    </Link>
  )
}

NavItem.propTypes = {
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired
}
