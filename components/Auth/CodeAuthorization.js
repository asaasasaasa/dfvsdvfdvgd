import React, { Component, Fragment } from 'react'
import { Mutation, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { merge, css } from 'glamor'

import { Button, Interaction, Field, A, InlineSpinner, colors } from '@project-r/styleguide'

import withT from '../../lib/withT'
import withMe, { meQuery } from '../../lib/apollo/withMe'
import { scrollIt } from '../../lib/utils/scroll'
import { MdDone } from 'react-icons/lib/md'

const { H3, P, Emphasis } = Interaction

const CODE_LENGTH = 6

const AUTHORIZE_SESSION = gql`
  mutation authorizeSession(
    $email: String!
    $tokens: [SignInToken!]!
    $consents: [String!]
    $requiredFields: RequiredUserFields
  ) {
    authorizeSession(
      email: $email
      tokens: $tokens
      consents: $consents
      requiredFields: $requiredFields
    )
  }
`

const styles = {
  button: css({
    width: 160,
    textAlign: 'center'
  }),
  help: css({
    listStyleType: 'none',
    marginTop: 40,
    paddingLeft: 0,
    '> li': {
      paddingBottom: 10
    }
  }),
  minimalHelp: css({
    color: '#000000',
    margin: '10px 0 0 0'
  }),
  minimalHelpDarkMode: css({
    color: colors.negative.text
  }),
  description: css({
    marginBottom: 20
  })
}

const checkCode = ({ value = '', shouldValidate, t }) => {
  const payload = value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH)

  return {
    code: value.replace(/[^0-9\s]/g, ''), // Allow digits and spaces
    payload,
    error: (
      (payload.length === 0 && t('Auth/CodeAuthorization/code/missing')) ||
      (payload.length < CODE_LENGTH && t('Auth/CodeAuthorization/code/tooShort'))
    ),
    dirty: shouldValidate
  }
}

class CodeAuthorization extends Component {
  constructor (props) {
    super(props)

    this.state = {
      code: '',
      payload: '',
      dirty: false,
      error: null
    }

    this.formRef = ref => {
      this.form = ref
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.me && this.props.me !== prevProps.me) {
      this.props.onSuccess(this.props.me)
    }
  }

  componentDidMount () {
    const { top, height } = this.form.getBoundingClientRect()
    const { pageYOffset, innerHeight } = window

    const target = pageYOffset + top - innerHeight + height + 20
    const inViewport = top + height < innerHeight

    if (!inViewport) {
      scrollIt(target, 400)
    }
  }

  render () {
    const { tokenType, email, onCancel, t, minimal, darkMode } = this.props
    const { code, dirty, error } = this.state

    const handleMutateError = () => {
      this.setState(() => ({ error: t('Auth/CodeAuthorization/code/invalid'), dirty: true }))
    }

    const listStyle = merge(
      styles.help,
      minimal && styles.minimalHelp,
      minimal && darkMode && styles.minimalHelpDarkMode)

    return (
      <Mutation mutation={AUTHORIZE_SESSION} awaitRefetchQueries>
        {(mutate, { loading }) => {
          const onSubmit = (e) => {
            e && e.preventDefault()

            mutate({
              variables: {
                email,
                tokens: [{ type: tokenType, payload: this.state.payload }]
              },
              refetchQueries: [{ query: meQuery }]
            })
              .catch(handleMutateError)
          }

          const autoSubmit = () => {
            if (this.state.payload && this.state.payload.length === CODE_LENGTH) {
              onSubmit()
            }
          }

          return (
            <form onSubmit={onSubmit} ref={this.formRef}>
              { minimal ? (
                <ul {...listStyle} style={{ marginTop: 20 }}>
                  <li>
                    {t.elements('Auth/CodeAuthorization/description/minimal', {
                      emphasis: <Emphasis key='emphasis'>
                        {t('Auth/CodeAuthorization/description/minimal/emphasis', { email: email })}
                      </Emphasis>
                    })}
                  </li>
                </ul>) : (<Fragment>
                  <H3>{t('Auth/CodeAuthorization/title')}</H3>
                  <P {...styles.description}>
                    {t.elements('Auth/CodeAuthorization/description', {
                      emphasis: <Emphasis key='emphasis'>{t('Auth/CodeAuthorization/description/emphasis')}</Emphasis>
                    })}
                  </P>
                </Fragment>) }
              <Field
                renderInput={props => (
                  <input {...props} pattern={'[0-9]*'} />
                )}
                label={t('Auth/CodeAuthorization/code/label')}
                value={code}
                autoComplete={'false'}
                error={dirty && error}
                black={minimal && !darkMode}
                white={minimal && darkMode}
                icon={minimal && <MdDone style={{ cursor: 'pointer' }} size={30} onClick={onSubmit} />}
                onChange={(_, value, shouldValidate) => {
                  this.setState(
                    checkCode({ value, shouldValidate, t }),
                    autoSubmit
                  )
                }} />
              { !minimal && (<div {...styles.button}>
                {loading
                  ? <InlineSpinner />
                  : <Button
                    block
                    type='submit'
                    primary
                    disabled={!code || error || loading}>
                    {t('Auth/CodeAuthorization/button/label')}
                  </Button>
                }
              </div>)}
              <ul {...listStyle}>
                <li>
                  <A href='#' onClick={onCancel}>
                    {t('Auth/CodeAuthorization/help/cancelLink')}
                  </A>
                </li>
                <li>
                  {t('Auth/CodeAuthorization/help/lastResort')}
                </li>
              </ul>
            </form>
          )
        }}
      </Mutation>
    )
  }
}

export default compose(withMe, withT)(CodeAuthorization)
