import React from 'react'
import { compose } from 'react-apollo'
import Editor from '../components/Shorts/Editor'
import Frame from '../components/Frame'
import { enforceMembership } from '../components/Auth/withMembership'

const meta = {
  title: 'Editor'
}

const Page = () => (
  <Frame meta={meta}>
    <Editor />
  </Frame>
)

export default compose(enforceMembership())(Page)
