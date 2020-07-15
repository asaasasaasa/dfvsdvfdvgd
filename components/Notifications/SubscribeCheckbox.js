import React, { useState } from 'react'
import { Checkbox, mediaQueries } from '@project-r/styleguide'
import { compose } from 'react-apollo'
import {
  withSubToDoc,
  withUnsubFromDoc,
  withSubToUser,
  withUnsubFromUser
} from './enhancers'
import { css } from 'glamor'
import withT from '../../lib/withT'

const styles = {
  checkbox: css({
    display: 'inline-block',
    width: '100%',
    [mediaQueries.mUp]: {
      width: '50%'
    }
  }),
  checkboxCallout: css({
    '& label': {
      fontSize: 16,
      display: 'flex',
      textAlign: 'left',
      alignItems: 'center'
    }
  }),
  checkboxLabelCallout: css({
    marginTop: -6
  })
}

const SubscribeCheckbox = ({
  t,
  subToDoc,
  unsubFromDoc,
  subToUser,
  unsubFromUser,
  subscription,
  setAnimate,
  callout,
  filters,
  filterName
}) => {
  const [isMutating, setIsMutating] = useState(false)
  const [serverError, setServerError] = useState()

  const isCurrentActive = filters
    ? filters.includes(filterName) && subscription.active
    : subscription.active
  const activeFilters = (subscription.active && subscription.filters) || []
  const isDocument =
    subscription.object && subscription.object.__typename === 'Document'

  const toggleCallback = () => {
    setIsMutating(false)
    setAnimate && setAnimate(true)
  }

  const toggleSubscribe = () => {
    setIsMutating(true)
    if (isDocument) {
      // Subscribe to Documents
      if (subscription.active) {
        unsubFromDoc({ subscriptionId: subscription.id })
          .then(toggleCallback)
          .catch(err => setServerError(err))
      } else {
        subToDoc({ documentId: subscription.object.id })
          .then(toggleCallback)
          .catch(err => setServerError(err))
      }
    } else if (!filters) {
      // User Subscribe/Unsubscribe without specifying if doc or comments, sub default to doc
      if (subscription.active) {
        unsubFromUser({
          subscriptionId: subscription.id
        })
          .then(toggleCallback)
          .catch(err => setServerError(err))
      } else {
        subToUser({
          userId: subscription.object.id,
          filters: ['Document']
        })
          .then(toggleCallback)
          .catch(err => setServerError(err))
      }
    }
    // Case where user can choose filter
    else if (isCurrentActive) {
      unsubFromUser({
        subscriptionId: subscription.id,
        filters: [filterName]
      })
        .then(toggleCallback)
        .catch(err => setServerError(err))
    } else {
      subToUser({
        userId: subscription.object.id,
        // Check if current filter already exists in filterlist, add if not
        filters:
          activeFilters.indexOf(filterName) === -1
            ? activeFilters.concat(filterName)
            : activeFilters
      })
        .then(toggleCallback)
        .catch(err => setServerError(err))
    }
  }

  return (
    <div {...(callout ? styles.checkboxCallout : styles.checkbox)}>
      <Checkbox
        disabled={isMutating}
        error={serverError}
        checked={isCurrentActive}
        onChange={toggleSubscribe}
      >
        <span {...(callout && styles.checkboxLabelCallout)}>
          {filterName
            ? t(`SubscribeCallout/${filterName}`)
            : isDocument
            ? subscription.object.meta.title
            : subscription.object.name}
        </span>
      </Checkbox>
    </div>
  )
}

export default compose(
  withT,
  withSubToDoc,
  withUnsubFromDoc,
  withSubToUser,
  withUnsubFromUser
)(SubscribeCheckbox)
