import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { documentFragment } from '../Feed/DocumentListContainer'

const getSearchAggregations = gql`
  query getSearchAggregations(
    $searchQuery: String
    $keys: [String!]
    $trackingId: ID
  ) {
    search(first: 1, search: $searchQuery, trackingId: $trackingId) {
      totalCount
      trackingId
      aggregations(keys: $keys) {
        key
        count
        label
        buckets {
          value
          count
          label
        }
      }
    }
  }
`

const getSearchResults = gql`
  query getSearchResults(
    $search: String
    $after: String
    $sort: SearchSortInput
    $trackingId: ID
  ) {
    search(
      first: 100
      after: $after
      search: $search
      sort: $sort
      trackingId: $trackingId
    ) {
      totalCount
      trackingId
      aggregations {
        key
        count
        label
        buckets {
          value
          count
          label
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
      nodes {
        entity {
          __typename
          ... on Document {
            ...DocumentListDocument
          }
          ... on Comment {
            id
            content
            text
            preview(length: 240) {
              string
              more
            }
            createdAt
            displayAuthor {
              id
              name
              slug
              profilePicture
              credential {
                description
                verified
              }
            }
            published
            updatedAt
            tags
            parentIds
            discussion {
              id
              title
              path
              document {
                id
                meta {
                  title
                  path
                  template
                  ownDiscussion {
                    id
                    closed
                  }
                }
              }
            }
          }
          ... on User {
            id
            slug
            firstName
            lastName
            credentials {
              verified
              description
              isListed
            }
            portrait
          }
        }
        highlights {
          path
          fragments
        }
        score
      }
    }
  }
  ${documentFragment}
`

export const withAggregations = graphql(getSearchAggregations, {
  props: ({ data, ownProps }) => ({
    dataAggregations: data
  })
})

export const withResults = graphql(getSearchResults, {
  options: props => ({
    variables: {
      search: props.searchQuery,
      sort: props.sort,
      trackingId: props.trackingId
    }
  }),
  props: ({ data, ownProps }) => ({
    data,
    fetchMore: ({ after }) =>
      data.fetchMore({
        variables: {
          after,
          search: ownProps.searchQuery,
          sort: ownProps.sort,
          trackingId: ownProps.trackingId
        },
        updateQuery: (previousResult, { fetchMoreResult, queryVariables }) => {
          const nodes = [
            ...previousResult.search.nodes,
            ...fetchMoreResult.search.nodes
          ]
          return {
            ...previousResult,
            totalCount: fetchMoreResult.search.pageInfo.hasNextPage
              ? fetchMoreResult.search.totalCount
              : nodes.length,
            search: {
              ...previousResult.search,
              ...fetchMoreResult.search,
              nodes
            }
          }
        }
      })
  })
})
