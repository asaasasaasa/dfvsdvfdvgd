import TagFilter from '../TagFilter'
import { css } from 'glamor'
import { A, pxToRem, Scroller, TabButton } from '@project-r/styleguide'
import { useDiscussion } from '../DiscussionProvider/context/DiscussionContext'
import { getFocusHref, getFocusUrl } from '../CommentLink'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { rerouteDiscussion } from '../DiscussionLink'
import { useTranslation } from '../../../lib/withT'

const styles = {
  reloadLink: css({
    display: 'flex',
    flexDirection: 'row-reverse',
    lineHeight: pxToRem('25px'),
    fontSize: pxToRem('16px')
  })
}

type Props = {
  meta?: any
}

const DiscussionOptions = ({ meta }: Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { discussion, refetch } = useDiscussion()
  const discussionType = meta?.discussionType
  const board = false // TODO

  const availableOrderBy = useMemo(() => {
    let items

    if (discussionType === 'statements') {
      items = ['DATE', 'VOTES']
    } else {
      items = ['DATE', 'VOTES', 'REPLIES']
      if (board) {
        items = ['HOT', ...items]
      }
    }

    return items
  }, [discussionType, board])

  const handleReload = async e => {
    e.preventDefault()
    const href = getFocusHref(discussion)
    if (href) {
      await router.replace(href)
      await refetch({
        focusId: undefined
      })
    } else {
      await refetch()
    }
  }

  return (
    <div>
      <TagFilter discussion={discussion} />
      <Scroller>
        {availableOrderBy.map(item => {
          return (
            <Link
              href={rerouteDiscussion(router, {
                order: item
              })}
              scroll={false}
              passHref
              key={item}
            >
              <TabButton
                border={false}
                text={t(`components/Discussion/OrderBy/${item}`)}
                isActive={item === discussion.comments.resolvedOrderBy}
              />
            </Link>
          )
        })}
      </Scroller>
      {handleReload && (
        <div>
          <A
            {...styles.reloadLink}
            href={getFocusUrl(discussion)}
            onClick={handleReload}
          >
            {t('components/Discussion/reload')}
          </A>
        </div>
      )}
    </div>
  )
}

export default DiscussionOptions
