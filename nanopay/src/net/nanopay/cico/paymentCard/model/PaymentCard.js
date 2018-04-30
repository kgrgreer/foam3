foam.CLASS({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCard',
  documentation: 'Model which describes a payment card.',

  javaImports: [
    'java.util.Calendar',
    'java.util.Date',
    'java.time.LocalDate',
    'java.time.ZoneId'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
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
      class: 'Map',
      name: 'externalParameters',
      documentation: 'External parameters provided by playment platform.'
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
      documentation: 'Address associated with the payment card'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'homeAddress',
      documentation: 'Address associated to the user adding the card'
    },
    {
      class: 'String',
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
      class: 'String',
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
    },
    {
      name: 'getExpiryMonth',
      code: function() {
        // .getMonth return 0 - 11; 0 for January
        var expirationMonth = this.expirationDate.getMonth() + 1;
        if ( expirationMonth < 10 ) {
          return '0' + expirationMonth;
        }
        return expirationMonth.toString();
      },
      javaReturns: 'String',
      javaCode: function() {`
LocalDate localDate = this.getExpirationDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
int month = localDate.getMonthValue();
if ( month < 10 ) {
  return "0" + month;
}
return String.valueOf(month);
      `},
      swiftReturns: 'String',
      swiftCode: function() {`
let calendar = Calendar.current

let month = calendar.component(.month, from: expirationDate)
if month < 10 {
  return "0\(month)"
}
return "\(month)"
      `}
    },
    {
      name: 'getExpiryYear',
      code: function() {
        var expirationYear = this.expirationDate.getFullYear();
        return expirationYear.toString().substring(2);
      },
      javaReturns: 'String',
      javaCode: function() {`
LocalDate localDate = this.getExpirationDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
int year = localDate.getYear();
return String.valueOf(year).substring(2);
      `},
      swiftReturns: 'String',
      swiftCode: function() {`
let calendar = Calendar.current

let year = calendar.component(.year, from: expirationDate)
let yearString = String(describing: year)
return yearString.dropFirst(2)
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
      name: 'OTHER',
      label: 'Other'
    },
    {
      name: 'CREDIT',
      label: 'Credit Card'
    },
    {
      name: 'DEBIT',
      label: 'Debit Card'
    },
    {
      name: 'LOYALTY',
      label: 'Loyalty Card'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardNetwork',
  documentation: 'Networks of payment cards.',

  values: [
    {
      name: 'OTHER',
      label: 'Other'
    },
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
    },
    {
      name: 'DISCOVER',
      label: 'Discover'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardPaymentPlatform',
  documentation: 'Payment platform to use to process the transaction using this payment card.',

  values: [
    {
      name: 'UNSUPPORTED',
      label: 'Unsupported'
    },
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
