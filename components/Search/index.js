import React, { Component } from 'react'
import { css } from 'glamor'

import { Router } from '../../lib/routes'
import track from '../../lib/piwik'

import { deserializeSort, serializeSort } from './serialize'

import Input from './Input'
import Results from './Results'

import { Center, mediaQueries } from '@project-r/styleguide'
import Filters from './Filters'

const styles = {
  container: css({
    padding: '15px 15px 120px',
    [mediaQueries.mUp]: {
      padding: '40px 0 120px'
    }
  })
}

class Search extends Component {
  constructor(props, ...args) {
    super(props, ...args)

    this.state = {
      loading: false,
      searchQuery: '',
      submittedQuery: '',
      sort: {
        key: 'publishedAt'
      },
      serializedSort: '',
      totalCount: 0,
      isMobile: true,
      allowFocus: true,
      trackingId: undefined
    }

    this.onInputChange = (_, value) => {
      if (value === this.state.searchQuery) {
        return
      }
      this.setState({
        searchQuery: value,
        allowFocus: true
      })
    }

    this.refreshSearch = () => {
      const sort = {
        key: 'relevance'
      }
      this.setState({
        submittedQuery: this.state.searchQuery,
        sort,
        allowFocus: !this.state.isMobile
      })
      this.updateUrl(undefined, serializeSort(sort))
      track([
        'trackSiteSearch',
        this.state.searchQuery,
        false,
        this.state.totalCount
      ])
    }

    this.resetSearch = () => {
      this.clearUrl()
      this.setState({
        searchQuery: '',
        submittedQuery: '',
        allowFocus: true,
        preloadedAggregations: null
      })
    }

    this.onSubmit = e => {
      e.preventDefault()
      e.stopPropagation()
      this.refreshSearch()
    }

    this.onSearchLoaded = search => {
      const { trackingId } = search
      if (!!trackingId && trackingId !== this.state.trackingId) {
        this.setState({
          trackingId
        })
      }
    }

    this.onTotalCountLoaded = totalCount => {
      this.setState({
        totalCount
      })
    }

    this.onAggregationsLoaded = aggregations => {
      this.setState({
        preloadedAggregations: aggregations
      })
    }

    this.onLoadMoreClick = () => {
      this.setState({
        allowFocus: false
      })
    }

    this.onSortClick = (sortKey, sortDirection) => {
      let sort = {
        key: sortKey
      }
      if (sortDirection) {
        sort.direction = sortDirection
      }
      const serializedSort = serializeSort(sort)
      this.setState({ sort, serializedSort })
      this.updateUrl(this.state.serializedFilters, serializedSort)
    }

    this.pushUrl = params => {
      Router.replaceRoute('search', params, { shallow: true })
    }

    this.updateUrl = sort => {
      const searchQuery = encodeURIComponent(this.state.searchQuery)
      this.pushUrl({ q: searchQuery, undefined, sort })
    }

    this.clearUrl = () => {
      this.pushUrl({})
    }

    this.handleResize = () => {
      const isMobile = window.innerWidth < mediaQueries.mBreakPoint
      if (isMobile !== this.state.isMobile) {
        this.setState({ isMobile })
      }
    }

    this.setStateFromQuery = query => {
      let newState = {}
      const decodedQuery = !!query.q && decodeURIComponent(query.q)

      if (decodedQuery && decodedQuery !== this.state.searchQuery) {
        newState = {
          ...newState,
          searchQuery: decodedQuery,
          submittedQuery: decodedQuery
        }
      }

      if (query.sort) {
        const rawSort =
          typeof query.sort === 'string' ? query.sort : query.sort[0]
        const sanitizedSort = deserializeSort(rawSort)
        const serializedSort = serializeSort(sanitizedSort)

        if (serializedSort !== this.state.serializedSort) {
          newState = {
            ...newState,
            sort: sanitizedSort,
            serializedSort
          }
        }
      }

      if (newState.submittedQuery || newState.sort) {
        this.setState(newState)
      }
    }
  }

  UNSAFE_componentWillReceiveProps({ query }) {
    this.setStateFromQuery(query)
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
    if (this.props.query) {
      this.setStateFromQuery(this.props.query)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  render() {
    const {
      searchQuery,
      submittedQuery,
      preloadedAggregations,
      totalCount,
      sort,
      allowFocus,
      trackingId
    } = this.state

    return (
      <Center {...styles.container}>
        <form onSubmit={this.onSubmit}>
          <Input
            value={searchQuery}
            allowSearch={searchQuery !== submittedQuery}
            allowFocus={allowFocus}
            onChange={this.onInputChange}
            onSearch={this.refreshSearch}
            onReset={this.resetSearch}
          />
        </form>
        <Filters />
        <Results
          searchQuery={submittedQuery}
          sort={sort}
          onSearch={this.refreshSearch}
          onSortClick={this.onSortClick}
          onTotalCountLoaded={this.onTotalCountLoaded}
          onLoadMoreClick={this.onLoadMoreClick}
          onSearchLoaded={this.onSearchLoaded}
          trackingId={trackingId}
        />
      </Center>
    )
  }
}

export default Search
