foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "CreatePaymentResponse",
  properties: [
    {
      class: 'Int',
      name: "ReferenceNumber"
    },
    {
      class: 'Float',
      name: "Amount"
    },
    {
      class: 'String',
      name: "Ccy"
    },
    {
      class: 'String',
      name: "PaymentDate"
    },
    {
      class: 'String',
      name: "Message"
    }
  ]
});
