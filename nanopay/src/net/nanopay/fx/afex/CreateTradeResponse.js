foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "CreateTradeResponse",
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Int',
      name: "TradeNumber"
    },
    {
      class: 'Float',
      name: "Amount"
    },
    {
      class: 'Float',
      name: "Rate"
    },
    {
      class: 'String',
      name: "TradeCcy"
    },
    {
      class: 'Float',
      name: "SettlementAmt"
    },
    {
      class: 'String',
      name: "SettlementCcy"
    },
    {
      class: 'String',
      name: "ValueDate"
    }
  ]
});
