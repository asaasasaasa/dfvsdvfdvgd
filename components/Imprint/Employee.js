import React from 'react'
import { Link } from '../../lib/routes'

import { Item } from '../../components/Testimonial/List'

const ProfileLink = ({ children, userId, username }) => {
  if (!userId && !username) {
    return children
  }
  return (
    <Link
      route='profile'
      params={{
        slug: `${username || userId}`
      }}
      passHref
    >
      {children}
    </Link>
  )
}

const Employee = ({ name, title, user, style, minColumns, maxColumns }) => {
  const displayName = name + (title ? `, ${title}` : '')
  if (!user) {
    return <Item name={displayName} style={{ cursor: 'default', ...style }} minColumns={minColumns} maxColumns={maxColumns} />
  }
  const { id, hasPublicProfile, portrait, username } = user
  if (!hasPublicProfile) {
    return <Item image={portrait} name={displayName} style={{ cursor: 'default', ...style }} minColumns={minColumns} maxColumns={maxColumns} />
  }
  return (
    <ProfileLink userId={id} username={username}>
      <Item image={portrait} name={displayName} style={style} minColumns={minColumns} maxColumns={maxColumns} />
    </ProfileLink>
  )
}

export default Employee
