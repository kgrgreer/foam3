foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'CanReceiveCurrency',

  documentation: 'A request to canAcceptCurrencyDAO.',

  properties: [
    {
      class: 'Long',
      name: 'userId',
      documentation: `
        Set this to a user's id. The DAO will check if this user is able to
        receive money in the currency with id currencyId.
      `,
      required: true
    },
    {
      class: 'String',
      name: 'currencyId',
      documentation: `currencyId is the alphabeticCode of Currency`,
      required: true
    },
    {
      class: 'Long',
      name: 'payerId',
      documentation: `
      Set this to the payer's id. The DAO will check if this user is able to
      send money in the currency with id currencyId.
      `
    },
    {
      class: 'Boolean',
      name: 'response',
      documentation: `
        The server will set this to true when you put it if the user can
        receive the currency.
      `
    },
    {
      class: 'String',
      name: 'message',
      documentation: `
        Response message to the client.
      `
    }
  ]
});
