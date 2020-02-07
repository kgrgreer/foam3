foam.CLASS({
    package: 'net.nanopay.bank',
    name: 'GetDefaultCurrency',
  
    documentation: 'A request to GetDefaultCurrencyDAO.',
  
    properties: [
      { 
        class: 'Long',
        name: 'contactId',
        documentation: `
          The DAO will find the contact associated to the given contact id
          and search the contact's verified bank accounts to return a default
          currency for payments to the contact.
        `,
        required: true
      },
      {
        class: 'String',
        name: 'response',
        documentation: `
          The server will set this to the denomination of the contact's verified
          bank account.
        `
      },
    ]
  });
  