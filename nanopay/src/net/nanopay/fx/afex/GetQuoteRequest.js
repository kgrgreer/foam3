foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "GetQuoteRequest",
  properties: [
    {
      class: 'String',
      name: "clientAPIKey"
    },
    {
      class: 'String',
      name: "currencyPair"
    },
    {
      class: 'String',
      name: "valueDate"
    },
    {
      class: "String",
      name: "optionDate"
    },
    {
      class: "String",
      name: "amount"
    }
  ]
});
