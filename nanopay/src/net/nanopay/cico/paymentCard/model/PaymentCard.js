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
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
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
    }
  ],

  methods: [
    {
      name: 'isExpired',
      code: function() {
        return Date().setHours(0,0,0,0) > this.expirationDate.setHours(0,0,0,0);
      },
      javaReturns: 'boolean',
      javaCode: function() {`
Calendar today = Calendar.getInstance();
today.set(Calendar.HOUR_OF_DAY, 0);
today.set(Calendar.MINUTE_OF_DAY, 0);
today.set(Calendar.SECOND_OF_DAY, 0);
return today.getTime().after(this.getExpirationDate());
      `},
      swiftReturns: 'Bool',
      swiftCode: function() {`
let date = Date()
let cal = Calendar(identifier: .gregorian)
let today = cal.startOfDay(for: date)

let expDate = cal.startOfDay(for: self.expirationDate)

return today > expDate
      `}
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
