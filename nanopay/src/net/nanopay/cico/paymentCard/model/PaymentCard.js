foam.CLASS({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCard',
  documentation: 'Model which describes a payment card.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.cico.paymentCard.model.PaymentCardType',
      name: 'type',
      documentation: 'Type of payment card. To be determined by decorator.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.cico.paymentCard.model.PaymentCardNetwork',
      name: 'network',
      documentation: 'Credit/Debit Network owner. To be determined by decorator.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.cico.paymentCard.model.PaymentCardPaymentPlatform',
      name: 'paymentPlatform',
      documentation: 'Payment platform that should be used to process this payment card'
    },
    {
      class: 'String',
      name: 'nickname',
      documentation: 'Name for easy recognition by user (optional)'
    },
    {
      class: 'String',
      name: 'cardholderFirstName',
      documentation: 'First name of cardholder'
    },
    {
      class: 'String',
      name: 'cardholderMiddleName',
      documentation: 'Middle name of cardholder'
    },
    {
      class: 'String',
      name: 'cardholderLastName',
      documentation: 'Last name of cardholder'
    },
    {
      class: 'foam.nanos.auth.Address',
      name: 'billingAddress',
      documentation: 'To reduce fraud by having the accurate billing address of the card.'
    },
    {
      class: 'Int',
      name: 'number',
      documentation: 'Number of payment card',
      required: true
    },
    {
      class: 'Date',
      name: 'expirationDate',
      documentation: 'Expiration date of payment card',
      required: true
    },
    {
      class: 'Int',
      name: 'cvv',
      documentation: 'CVV of payment card',
      required: true,
      storageTransient: true
    },
    {
      class: 'Bool',
      name: 'expired',
      documentation: 'An expression to check if the card is expired.',
      transient: true,
      storageTransient: true,
      expression: function( expirationDate ) {
        // if today's date is later than the expiration date
        return Date().setHours(0,0,0,0) > expirationDate.setHours(0,0,0,0);
      }
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardType',
  documentation: 'Types of payment cards.',

  values: [
    {
      name: 'CREDIT',
      label: 'Credit Card'
    },
    {
      name: 'DEBIT',
      label: 'Debit Card'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardNetwork',
  documentation: 'Networks of payment cards.',

  values: [
    {
      name: 'VISA',
      label: 'Visa'
    },
    {
      name: 'MASTERCARD',
      label: 'Master Card'
    },
    {
      name: 'AMERICANEXPRESS',
      label: 'American Express'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardPaymentPlatform',
  documentation: 'Payment platform to use to process the transaction using this payment card.',

  values: [
    {
      name: 'STRIPE',
      label: 'Stripe'
    },
    {
      name: 'AUTHORIZE',
      label: 'Authorize.net'
    },
    {
      name: 'GLOBALPAYMENTS',
      label: 'Global Payments'
    }
  ]
});
