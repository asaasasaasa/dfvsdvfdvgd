import React from 'react'
import { compose, graphql } from 'react-apollo'
import { nest } from 'd3-collection'
import { css } from 'glamor'
import {
  colors,
  Interaction,
  RawHtml,
  linkRule,
  mediaQueries,
  Label,
  fontStyles
} from '@project-r/styleguide'

import { notificationsQuery } from '../Notifications/enhancers'
import Loader from '../Loader'
import { timeFormat } from '../../lib/utils/format'
import { Link } from '../../lib/routes'
import PathLink from '../Link/Path'
import withT from '../../lib/withT'

const dateFormat = timeFormat('%d.%m')

const groupByDate = nest().key(n => {
  return dateFormat(new Date(n.createdAt))
})

const NotificationFeedMini = ({
  t,
  data: { notifications, loading, error }
}) => {
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const { nodes } = notifications
        const isNew = node => !node.readAt || new Date() < new Date(node.readAt)
        if (!nodes) return null
        return (
          <>
            {!nodes.length && (
              <>
                <Link route='subscriptionsSettings' passHref>
                  <a {...linkRule}>{t('Notifications/settings')}</a>
                </Link>
                <Interaction.P>
                  <RawHtml
                    dangerouslySetInnerHTML={{
                      __html: t('Notifications/empty/paragraph')
                    }}
                  />
                </Interaction.P>
              </>
            )}

            {groupByDate
              .entries(nodes.slice(0, 3))
              .map(({ key, values }, i, all) => {
                return (
                  <>
                    {values.map((node, j) => {
                      const { object } = node
                      if (
                        !object ||
                        (object.__typename === 'Comment' && !object.published)
                      ) {
                        return (
                          <div {...styles.unpublished} key={j}>
                            <Label>
                              {t('Notifications/unpublished/label')}
                            </Label>
                          </div>
                        )
                      }
                      return (
                        <div {...styles.notificationItem} key={j}>
                          {isNew(node) && <span {...styles.unreadDot} />}

                          <PathLink
                            {...styles.cleanLink}
                            path={object.meta.path}
                            passHref
                          >
                            <>
                              {dateFormat(new Date(node.createdAt))}{' '}
                              {node.content.title}
                            </>
                          </PathLink>
                        </div>
                      )
                    })}
                  </>
                )
              })}
          </>
        )
      }}
    />
  )
}

const styles = {
  unpublished: css({
    borderTop: `1px solid ${colors.text}`,
    margin: 0,
    paddingTop: 10,
    paddingBottom: 40
  }),
  unpublishedTitle: css({
    ...fontStyles.sansSerifMedium14,
    [mediaQueries.mUp]: fontStyles.sansSerifMedium16,
    margin: '5px 0 3px'
  }),
  cleanLink: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  notificationItem: css({
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    ...fontStyles.sansSerifRegular14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    [mediaQueries.mUp]: fontStyles.sansSerifRegular16
  }),
  unreadDot: css({
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 8,
    border: `1px solid ${colors.containerBg}`,
    background: 'red'
  })
}

export default compose(withT, graphql(notificationsQuery))(NotificationFeedMini)
