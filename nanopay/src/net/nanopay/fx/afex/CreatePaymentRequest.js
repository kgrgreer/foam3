foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "CreatePaymentRequest",
  properties: [
    {
      class: 'String',
      name: "clientAPIKey"
    },
    {
      class: 'String',
      name: "amount"
    },
    {
      class: 'String',
      name: "currency"
    },
    {
      class: 'String',
      name: "note"
    },
    {
      class: 'String',
      name: "paymentDate"
    },
    {
      class: 'String',
      name: "popCode"
    },
    {
      class: 'String',
      name: "purposeOfPayment"
    },
    {
      class: 'String',
      name: "referenceNumber"
    },
    {
      class: 'String',
      name: "vendorId"
    }
  ]
});
