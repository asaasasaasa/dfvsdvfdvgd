import React, { useMemo } from 'react'
import {
  Loader,
  DiscussionCommentsWrapper,
  pxToRem
} from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'
import { useDiscussion } from './DiscussionProvider/context/DiscussionContext'
import DiscussionComposerWrapper from './DiscussionProvider/components/DiscussionComposerWrapper'
import DiscussionComposer from './shared/DiscussionComposer'
import AbstractDiscussionCommentsRenderer from './AbstractDiscussionCommentsRenderer'
import DiscussionOptions from './shared/DiscussionOptions'
import makeCommentTree from './DiscussionProvider/helpers/makeCommentTree'
import { css } from 'glamor'

const styles = {
  commentsWrapper: css({
    marginTop: pxToRem(20)
  })
}

type Props = {
  meta: any
}

const AbstractDiscussion = ({ meta }: Props) => {
  const { t } = useTranslation()

  const {
    discussion,
    loading,
    error,
    fetchMore,
    focus: { error: focusError }
  } = useDiscussion()

  const comments = useMemo(() => {
    if (!discussion) {
      return {
        totalCount: 0,
        directTotalCount: 0,
        pageInfo: {},
        nodes: []
      }
    }
    return makeCommentTree(discussion?.comments)
  }, [discussion])

  const loadMore = async (): Promise<unknown> => {
    if (!discussion) return
    const lastNode =
      discussion.comments.nodes[discussion.comments.nodes.length - 1]
    const endCursor = discussion.comments.pageInfo.endCursor
    await fetchMore({
      after: endCursor,
      appendAfter: lastNode.id
    })
  }

  return (
    <Loader
      loading={loading || !discussion}
      error={error}
      render={() => (
        <div>
          <div>
            <DiscussionComposerWrapper isTopLevel showPayNotes>
              <DiscussionComposer
                isRootLevel
                placeholder={
                  meta?.discussionType === 'statements'
                    ? 'components/Discussion/Statement/Placeholder'
                    : undefined
                }
              />
            </DiscussionComposerWrapper>
          </div>
          <div {...styles.commentsWrapper}>
            <DiscussionOptions meta={meta} />
            <DiscussionCommentsWrapper
              t={t}
              loadMore={loadMore}
              moreAvailableCount={
                comments.directTotalCount - comments.nodes.length
              }
              tagMappings={meta?.tagMappings}
            >
              <AbstractDiscussionCommentsRenderer
                comments={comments.nodes}
                fetchMore={fetchMore}
                isBoard={discussion?.isBoard}
                meta={meta}
              />
            </DiscussionCommentsWrapper>
          </div>
        </div>
      )}
    />
  )
}

export default AbstractDiscussion
