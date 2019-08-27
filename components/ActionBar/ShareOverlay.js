import React from 'react'

import {
  Overlay, OverlayBody,
  OverlayToolbar, OverlayToolbarConfirm,
  Interaction
} from '@project-r/styleguide'

import MdClose from 'react-icons/lib/md/close'

import withT from '../../lib/withT'

import ShareButtons from './ShareButtons'

const ShareOverlay = ({
  t,
  title,
  url,
  tweet,
  emailSubject,
  emailBody,
  emailAttachUrl,
  fill,
  onClose
}) => {
  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth: 400, minHeight: 'none' }}>
      <OverlayToolbar>
        <Interaction.Emphasis style={{ padding: '15px 20px', fontSize: 16 }}>
          {title}
        </Interaction.Emphasis>
        <OverlayToolbarConfirm
          onClick={onClose}
          label={<MdClose size={24} fill='#000' />}
        />
      </OverlayToolbar>
      <OverlayBody>
        <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
          <ShareButtons
            onClose={onClose}
            url={url}
            tweet={tweet}
            emailSubject={emailSubject}
            emailBody={emailBody}
            emailAttachUrl={emailAttachUrl} />
        </div>
      </OverlayBody>
    </Overlay>
  )
}

export default withT(ShareOverlay)
