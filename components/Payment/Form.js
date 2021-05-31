import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Interaction,
  Label,
  A,
  fontStyles,
  Loader,
  useColorContext,
  Checkbox,
  Radio
} from '@project-r/styleguide'
import { LockIcon } from '@project-r/styleguide/icons'

import { AutoForm as AddressForm, AddressView } from '../Account/AddressForm'

import { PF_FORM_ACTION, PAYPAL_FORM_ACTION } from '../../lib/constants'

import { inNativeAppBrowser } from '../../lib/withInNativeApp'

import * as postfinance from './postfinance'
import * as paypal from './paypal'

import * as PSPIcons from './PSPIcons'

import { format } from 'd3-format'

import StripeForm from './Form/Stripe'

const pad2 = format('02')

const PAYMENT_METHODS = [
  {
    disabled: false,
    key: 'STRIPE',
    Icon: ({ values }) => {
      return (
        <span>
          <span
            style={{
              opacity: !values.cardType || values.cardType === 'visa' ? 1 : 0.4
            }}
          >
            <PSPIcons.Visa />
          </span>
          <span
            style={{
              display: values.cardType === 'amex' ? 'none' : 'inline',
              opacity:
                !values.cardType || values.cardType === 'mastercard' ? 1 : 0.4
            }}
          >
            <PSPIcons.Mastercard />
          </span>
          <span
            style={{
              display: values.cardType === 'amex' ? 'inline' : 'none',
              opacity: !values.cardType || values.cardType === 'amex' ? 1 : 0.4
            }}
          >
            <PSPIcons.Amex />
          </span>
        </span>
      )
    }
  },
  {
    disabled: inNativeAppBrowser,
    key: 'POSTFINANCECARD',
    bgColor: '#FCCC12',
    Icon: PSPIcons.Postcard
  },
  {
    disabled: false,
    key: 'PAYMENTSLIP'
  },
  {
    disabled: inNativeAppBrowser,
    key: 'PAYPAL',
    Icon: PSPIcons.PayPal
  }
]

const PAYMENT_METHOD_HEIGHT = 64

const styles = {
  secureContainer: css({
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0px 20px 0px'
  }),
  secureText: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 14,
    marginLeft: 5
  }),
  paymentMethod: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 14,
    display: 'inline-block',
    borderWidth: 1,
    borderStyle: 'solid',
    height: PAYMENT_METHOD_HEIGHT - 2, // 2px borders
    padding: 10,
    cursor: 'pointer',
    marginRight: 10,
    marginBottom: 10,
    lineHeight: 0,
    verticalAlign: 'top',
    '& input': {
      display: 'none'
    }
  }),
  paymentMethodText: css({
    lineHeight: '40px',
    verticalAlign: 'middle'
  }),
  paymentMethodSourceText: css({
    display: 'inline-block',
    paddingLeft: 15,
    paddingRight: 10,
    lineHeight: '20px',
    verticalAlign: 'middle'
  }),
  paymentMethodHiddenText: css({
    position: 'absolute',
    left: -10000,
    top: 'auto'
  })
}

const PaymentMethodLabel = ({
  backgroundColor = '#fff',
  active,
  error,
  children
}) => {
  const [colorScheme] = useColorContext()
  return (
    <label
      {...styles.paymentMethod}
      {...colorScheme.set('borderColor', error ? 'error' : 'text')}
      {...colorScheme.set(
        'color',
        error ? 'error' : '#000' // because backgroundColor is #fff even in dark mode
      )}
      style={{
        backgroundColor,
        opacity: active ? 1 : 0.4
      }}
    >
      {children}
    </label>
  )
}

const { H2, P } = Interaction

class PaymentForm extends Component {
  constructor(...args) {
    super(...args)
    this.state = {}
    this.stripeRef = ref => {
      this.stripe = ref
    }
    this.postFinanceFormRef = ref => {
      this.postFinanceForm = ref
    }
    this.payPalFormRef = ref => {
      this.payPalForm = ref
    }
  }
  componentDidMount() {
    this.autoSelect()
  }
  componentDidUpdate() {
    this.autoSelect()
  }
  autoSelect() {
    const {
      paymentSource,
      loadingPaymentSource,
      allowedMethods,
      values,
      onChange
    } = this.props
    if (
      (!loadingPaymentSource && values.paymentSource === undefined) ||
      (values.paymentMethod &&
        allowedMethods &&
        allowedMethods.indexOf(values.paymentMethod) === -1)
    ) {
      const stripeAllowed = allowedMethods
        ? allowedMethods.indexOf('STRIPE') !== -1
        : true
      if (paymentSource && stripeAllowed) {
        onChange({
          values: {
            paymentMethod: 'STRIPE',
            paymentSource: paymentSource.id
          }
        })
      } else {
        onChange({
          values: {
            paymentMethod: allowedMethods[0],
            paymentSource: null,
            newSource: true
          }
        })
      }
    }
  }
  render() {
    const {
      t,
      allowedMethods,
      payload,
      values,
      errors,
      dirty,
      onChange,
      paymentSource,
      loadingPaymentSource,
      addressState,
      shippingAddressState,
      context,
      requireShippingAddress,
      userName,
      userAddress,
      packageGroup,
      syncAddresses,
      setSyncAddresses
    } = this.props
    const { paymentMethod } = values
    const visibleMethods = allowedMethods || PAYMENT_METHODS.map(pm => pm.key)

    const hasChoice = visibleMethods.length > 1
    const onlyStripe = !hasChoice && visibleMethods[0] === 'STRIPE'
    const stripeNote = t.first(
      [
        context &&
          `payment/stripe/${onlyStripe ? 'only' : 'prefered'}/${context}`,
        `payment/stripe/${onlyStripe ? 'only' : 'prefered'}`
      ].filter(Boolean),
      undefined,
      ''
    )

    const paymentMethodForm = !values.paymentSource && paymentMethod

    return (
      <div>
        {requireShippingAddress && (
          <div style={{ marginBottom: 40 }}>
            <H2 style={{ marginBottom: 10 }}>
              {t('pledge/address/shipping/title')}
            </H2>
            <AddressForm
              {...shippingAddressState}
              afterEdit={
                userAddress || packageGroup === 'GIVE' ? (
                  <>
                    <Checkbox
                      checked={syncAddresses}
                      onChange={(_, checked) => {
                        setSyncAddresses(checked)
                      }}
                    >
                      {t(
                        `pledge/address/shipping/${
                          userAddress ? 'updateAccount' : 'setAccount'
                        }`
                      )}
                    </Checkbox>
                    <br style={{ clear: 'left' }} />
                  </>
                ) : (
                  undefined
                )
              }
              existingAddress={userAddress}
              name={userName}
            />
          </div>
        )}
        <H2>
          {t.first(
            [
              context &&
                `payment/title${!hasChoice ? '/single' : ''}/${context}`,
              `payment/title${!hasChoice ? '/single' : ''}`
            ].filter(Boolean)
          )}
        </H2>
        <div {...styles.secureContainer}>
          <LockIcon size={16} />
          <span {...styles.secureText}>{t('payment/secure')}</span>
        </div>
        <Loader
          style={{ minHeight: PAYMENT_METHOD_HEIGHT * 2 }}
          loading={loadingPaymentSource}
          render={() => {
            const hasPaymentSource = !!paymentSource
            const PaymentSourceIcon =
              hasPaymentSource &&
              ((paymentSource.brand.toLowerCase() === 'visa' && (
                <PSPIcons.Visa />
              )) ||
                (paymentSource.brand.toLowerCase() === 'mastercard' && (
                  <PSPIcons.Mastercard />
                )) ||
                ((paymentSource.brand.toLowerCase() === 'american express' ||
                  paymentSource.brand.toLowerCase() === 'amex') && (
                  <PSPIcons.Amex />
                )))
            const paymentSourceDisabled =
              paymentSource && paymentSource.status !== 'CHARGEABLE'

            const showMethods = !hasPaymentSource || values.newSource

            return (
              <P>
                {hasPaymentSource && (
                  <Fragment>
                    <Label>{t('payment/method/existing')}</Label>
                    <br />
                    <PaymentMethodLabel
                      active={values.paymentSource === paymentSource.id}
                      error={paymentSourceDisabled}
                    >
                      <input
                        type='radio'
                        name='paymentMethod'
                        disabled={paymentSourceDisabled}
                        onChange={event => {
                          event.preventDefault()
                          const value = event.target.value
                          onChange({
                            values: {
                              newSource: false,
                              paymentMethod: 'STRIPE',
                              paymentSource: value
                            }
                          })
                        }}
                        value={paymentSource.id}
                        checked={values.paymentSource === paymentSource.id}
                      />
                      {PaymentSourceIcon}
                      {PaymentSourceIcon && (
                        <span {...styles.paymentMethodHiddenText}>
                          {paymentSource.brand}
                        </span>
                      )}
                      <span {...styles.paymentMethodSourceText}>
                        {!PaymentSourceIcon && paymentSource.brand}
                        {'**** '}
                        {paymentSource.last4}
                        <br />
                        {pad2(paymentSource.expMonth)}/{paymentSource.expYear}
                      </span>
                    </PaymentMethodLabel>
                    <br />
                  </Fragment>
                )}
                {!hasPaymentSource && hasChoice && (
                  <Label>{t('payment/method/choose')}</Label>
                )}
                {hasPaymentSource && !showMethods && (
                  <Label>
                    <A
                      href='#show'
                      onClick={e => {
                        e.preventDefault()
                        onChange({
                          values: {
                            newSource: true,
                            paymentSource: null
                          }
                        })
                      }}
                    >
                      {t(`payment/method/new${onlyStripe ? '/stripe' : ''}`)}
                    </A>
                  </Label>
                )}
                {hasPaymentSource && showMethods && (
                  <Label>
                    {t(`payment/method/new${onlyStripe ? '/stripe' : ''}`)}
                  </Label>
                )}
                {(hasChoice || hasPaymentSource) && <br />}
                {showMethods &&
                  PAYMENT_METHODS.filter(
                    pm => !pm.disabled && visibleMethods.indexOf(pm.key) !== -1
                  ).map(pm => (
                    <PaymentMethodLabel
                      key={pm.key}
                      backgroundColor={pm.bgColor}
                      active={
                        (paymentMethod === pm.key && !values.paymentSource) ||
                        !values.paymentMethod
                      }
                    >
                      <input
                        type='radio'
                        name='paymentMethod'
                        disabled={pm.disabled}
                        onChange={event => {
                          event.preventDefault()

                          onChange({
                            values: {
                              paymentMethod: pm.key,
                              paymentSource: null
                            }
                          })
                        }}
                        value={pm.key}
                        checked={
                          paymentMethod === pm.key && !values.paymentSource
                        }
                      />
                      {pm.Icon ? <pm.Icon values={values} /> : null}
                      <span
                        {...(pm.Icon
                          ? styles.paymentMethodHiddenText
                          : styles.paymentMethodText)}
                      >
                        {t(`payment/method/${pm.key}`)}
                      </span>
                    </PaymentMethodLabel>
                  ))}
              </P>
            )
          }}
        />
        {paymentMethodForm === 'PAYMENTSLIP' && (
          <div>
            <Label>{t('payment/paymentslip/explanation')}</Label>
            <br />
            <br />
            <div style={{ marginBottom: 10 }}>
              <Label>{t('pledge/address/payment/title')}</Label>
            </div>
            {requireShippingAddress && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ marginBottom: 5 }}>
                  <Radio
                    checked={syncAddresses}
                    onChange={() => {
                      setSyncAddresses(true)
                    }}
                  >
                    {t('pledge/address/payment/likeShipping')}
                  </Radio>
                </div>
                <div>
                  <Radio
                    checked={!syncAddresses}
                    onChange={() => {
                      setSyncAddresses(false)
                    }}
                  >
                    {t('pledge/address/payment/other')}
                  </Radio>
                </div>
              </div>
            )}
            {syncAddresses ? (
              shippingAddressState.isValid && (
                <AddressView values={shippingAddressState.values} />
              )
            ) : (
              <AddressForm
                {...addressState}
                existingAddress={
                  requireShippingAddress ? undefined : userAddress
                }
                name={userName}
              />
            )}
            {/* <div style={{marginBottom: 5}}>
              <Radio
                checked={!values.paperInvoice}
                onChange={() => {
                  onChange({
                    values: {
                      paperInvoice: false
                    }
                  })
                }}>
                {t('payment/paymentslip/emailInvoice')}
              </Radio>
            </div>
            <div>
              <Radio
                checked={!!values.paperInvoice}
                onChange={() => {
                  onChange({
                    values: {
                      paperInvoice: true
                    }
                  })
                }}>
                {t('payment/paymentslip/paperInvoice')}
              </Radio>
            </div> */}
          </div>
        )}
        {paymentMethodForm === 'STRIPE' && (
          <>
            {stripeNote && <Label>{stripeNote}</Label>}
            <StripeForm
              t={t}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
              ref={this.stripeRef}
            />
          </>
        )}
        {paymentMethodForm === 'POSTFINANCECARD' && (
          <form
            ref={this.postFinanceFormRef}
            method='post'
            action={PF_FORM_ACTION}
          >
            {postfinance
              .getParams({
                userId: payload.userId,
                orderId: payload.id,
                amount: payload.total,
                alias: payload.pfAliasId,
                sha: payload.pfSHA
              })
              .map(param => (
                <input
                  key={param.key}
                  type='hidden'
                  name={param.key}
                  value={param.value || ''}
                />
              ))}
          </form>
        )}
        {paymentMethodForm === 'PAYPAL' && (
          <form
            ref={this.payPalFormRef}
            method='post'
            action={PAYPAL_FORM_ACTION}
          >
            {paypal
              .getParams({
                itemName: payload.id,
                amount: payload.total
              })
              .map(param => (
                <input
                  key={param.key}
                  type='hidden'
                  name={param.key}
                  value={param.value || ''}
                />
              ))}
          </form>
        )}
      </div>
    )
  }
}

PaymentForm.propTypes = {
  t: PropTypes.func.isRequired,
  loadSources: PropTypes.bool.isRequired,
  accessToken: PropTypes.string,
  allowedMethods: PropTypes.arrayOf(
    PropTypes.oneOf(PAYMENT_METHODS.map(method => method.key))
  ),
  payload: PropTypes.shape({
    id: PropTypes.string,
    userId: PropTypes.string,
    total: PropTypes.number,
    pfAliasId: PropTypes.string,
    pfSHA: PropTypes.string
  }).isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  dirty: PropTypes.object.isRequired
}

// look into PARAMPLUS for PF
// https://e-payment-postfinance.v-psp.com/~/media/kdb/pdf/postfinance/en/123ae0b9-2864-48d4-9b06-7ed2d70db029/e-commerce.ashx
// something for paypal

// export const withPayment = Component => Component

// pay (context)
// payment
// - pay
// - errors
// - receiveError
// - context

export const query = gql`
  query myPaymentSource($accessToken: ID) {
    me(accessToken: $accessToken) {
      id
      defaultPaymentSource {
        id
        status
        brand
        last4
        expMonth
        expYear
        isDefault
        isExpired
      }
    }
  }
`

// all HOCs must support getWrappedInstance here
export default compose(
  graphql(query, {
    skip: props => !props.loadSources,
    withRef: true,
    options: ({ accessToken }) => ({
      fetchPolicy: 'network-only',
      ssr: false,
      variables: { accessToken }
    }),
    props: ({ data }) => ({
      paymentSource: data.me?.defaultPaymentSource,
      loadingPaymentSource: data.loading
    })
  })
)(PaymentForm)
