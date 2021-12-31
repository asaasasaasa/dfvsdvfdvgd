import React from 'react'
import SubscribeCheckbox from './SubscribeCheckbox'
import withT from '../../lib/withT'
import SubscribeCalloutTitle from './SubscribeCalloutTitle'

const SubscribeDocument = ({ t, subscriptions, setAnimate }) => {
  return (
    <>
      <SubscribeCalloutTitle>
        {t('SubscribeDocument/title')}
      </SubscribeCalloutTitle>
      {subscriptions.map(subscription => (
        <SubscribeCheckbox
          key={subscription.id}
          subscription={subscription}
          setAnimate={setAnimate}
          callout
        />
      ))}
    </>
  )
}

export default withT(SubscribeDocument)
