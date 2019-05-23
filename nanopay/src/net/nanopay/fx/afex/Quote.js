foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "Quote",
  properties: [
    {
      class: 'Double',
      name: "rate"
    },
    {
      class: 'Double',
      name: "invertedRate"
    },
    {
      class: 'Date',
      name: "valueDate"
    },
    {
      class: 'Date',
      name: "optionDate"
    },
    {
      class: 'String',
      name: "quoteId"
    },
    {
      class: 'String',
      name: "terms"
    },
    {
      class: 'Double',
      name: "Amount"
    },
    {
      class: 'Boolean',
      name: "isAmountSettlement"
    }
  ]
});
