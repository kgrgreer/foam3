foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "Quote",
  properties: [
    {
      class: 'Double',
      name: "Rate"
    },
    {
      class: 'Double',
      name: "InvertedRate"
    },
    {
      class: 'Date',
      name: "ValueDate"
    },
    {
      class: 'Date',
      name: "OptionDate"
    },
    {
      class: 'String',
      name: "QuoteId"
    },
    {
      class: 'String',
      name: "Terms"
    },
    {
      class: 'Double',
      name: "Amount"
    },
    {
      class: 'Boolean',
      name: "IsAmountSettlement"
    }
  ]
});
