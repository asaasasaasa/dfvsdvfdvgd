import React from 'react'

import ShareOverlay from '../../ShareOverlay'
import { useDiscussion } from '../context/DiscussionContext'
import { DiscussionPreferences } from '../../DiscussionPreferences'
import useDiscussionPreferences from '../hooks/useDiscussionPreferences'
import { useTranslation } from '../../../../lib/withT'

const DiscussionOverlays = () => {
  const { t } = useTranslation()
  const {
    id,
    discussion,
    overlays: { preferencesOverlay, shareOverlay }
  } = useDiscussion()
  const {
    discussionPreferences,
    loading,
    error,
    setDiscussionPreferencesHandler
  } = useDiscussionPreferences(id)
  const noPreferences = discussion?.userPreference?.notifications === null
  const autoCredential =
    noPreferences &&
    !discussion?.userPreference?.anonymity &&
    discussionPreferences?.me?.credentials?.find(c => c.isListed)

  return (
    <>
      {preferencesOverlay.open && (
        <DiscussionPreferences
          t={t}
          discussionId={discussion.id}
          discussionPreferences={{
            ...discussionPreferences,
            loading,
            error
          }}
          setDiscussionPreferences={setDiscussionPreferencesHandler}
          onClose={preferencesOverlay.handleClose}
          autoCredential={
            undefined /* autoCredential // tmp disabled since currently not handled in statement submit */
          }
        />
      )}

      {shareOverlay.open && (
        <ShareOverlay
          discussionId={discussion.id}
          onClose={shareOverlay.handleClose}
          url={shareOverlay.data}
          title={discussion.title}
        />
      )}
    </>
  )
}

export default DiscussionOverlays
