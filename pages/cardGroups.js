import React from 'react'
import { withRouter } from 'next/router'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { descending } from 'd3-array'
import { css } from 'glamor'

import withT from '../lib/withT'
import { Link, routes } from '../lib/routes'
import {
  PUBLIC_BASE_URL,
  CDN_FRONTEND_BASE_URL
} from '../lib/constants'

import Frame from '../components/Frame'
import Loader from '../components/Loader'
import Container from '../components/Card/Container'
import Cantons from '../components/Card/Cantons'
import Logo from '../components/Card/Logo'
import Beta from '../components/Card/Beta'
import { Editorial, Interaction, colors } from '@project-r/styleguide'

const query = gql`
query {
  cardGroups(first: 50) {
    nodes {
      id
      slug
      name
      cards {
        totalCount
      }
    }
  }
}
`

const SIZE = 40
const WIDTH = 250
const MARGIN = 10

const styles = {
  cantons: css({
    maxWidth: WIDTH * 3 + MARGIN * 2 * 3,
    margin: '0 auto',
    textAlign: 'center'
  }),
  canton: css(Interaction.fontRule, {
    fontSize: 16,
    position: 'relative',
    paddingLeft: SIZE + 10,
    paddingTop: 0,
    display: 'inline-block',
    color: colors.text,
    margin: MARGIN,
    textAlign: 'left',
    width: WIDTH,
    height: SIZE,
    overflow: 'hidden',
    textDecoration: 'none'
  }),
  icon: css({
    position: 'absolute',
    left: 0,
    top: 0
  })
}

const Page = ({ data, data: { cardGroups }, t }) => (
  <Frame raw footer={false} meta={{
    pageTitle: t('pages/cardGroups/pageTitle'),
    title: t('pages/cardGroups/pageTitle'),
    description: t('pages/cardGroups/description'),
    url: `${PUBLIC_BASE_URL}${routes.find(r => r.name === 'cardGroups').toPath()}`,
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/republik-wahltindaer-08.png`
  }}>
    <Container>
      <div style={{ padding: 10, maxWidth: 700, margin: '40px auto 0', textAlign: 'center' }}>
        <Editorial.Headline>
          {t('pages/cardGroups/headline')}
          <span style={{ position: 'relative' }}>
            <Logo style={{
              marginLeft: 20,
              marginBottom: -20
            }} size={80} />
            <Beta style={{
              position: 'absolute',
              left: -40,
              bottom: -23
            }} />
          </span>
        </Editorial.Headline>
        <Editorial.P>
          {t('pages/cardGroups/lead')}
          {' '}
          <Editorial.A href='/wahltindaer/meta'>{t('pages/cardGroups/lead/more')}</Editorial.A>
        </Editorial.P>
        <Editorial.P>
          <strong>{t('pages/cardGroups/choose')}</strong>
        </Editorial.P>
      </div>
      <Loader loading={data.loading} error={data.error} render={() => {
        const groups = []
          .concat(cardGroups.nodes)
          .sort((a, b) => descending(a.cards.totalCount, b.cards.totalCount))

        return (
          <div {...styles.cantons} style={{ opacity: 1 }}>
            {groups.map(cardGroup => {
              const Icon = Cantons[cardGroup.slug] || null

              return (
                <Link key={cardGroup.slug} route='cardGroup' params={{ group: cardGroup.slug }} passHref>
                  <a {...styles.canton}>
                    {Icon && <Icon size={SIZE} {...styles.icon} />}
                    <strong>{cardGroup.name}</strong>
                    <br />
                    {t.pluralize('pages/cardGroups/cardCount', {
                      count: cardGroup.cards.totalCount
                    })}
                  </a>
                </Link>
              )
            })}
          </div>
        )
      }} />
      <br />
      <br />
    </Container>
  </Frame>
)

export default compose(
  withRouter,
  withT,
  graphql(query)
)(Page)