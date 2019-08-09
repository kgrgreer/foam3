foam.INTERFACE({
  package: 'net.nanopay.fx.afex',
  name: 'AFEX',

  documentation: 'Interface to the AFEX service',

  methods: [
    {
      name: 'getToken',
      documentation: 'Get token',
      async: true,
      type: 'net.nanopay.fx.afex.Token'
    },
    {
      name: 'onboardCorporateClient',
      documentation: 'Create a new corporate client account',
      async: true,
      type: 'net.nanopay.fx.afex.OnboardCorporateClientResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.OnboardCorporateClientRequest'
        }
      ]
    },
    {
      name: 'getClientAccountStatus',
      documentation: 'Get the account status of a child account by API key',
      async: true,
      type: 'net.nanopay.fx.afex.GetClientAccountStatusResponse',
      args: [
        {
          name: 'clientAPIKey',
          type: 'String'
        }
      ]
    },
    {
      name: 'retrieveClientAccountDetails',
      documentation: 'Get the account account details for the specified client',
      async: true,
      type: 'net.nanopay.fx.afex.RetrieveClientAccountDetailsResponse',
      args: [
        {
          name: 'clientAPIKey',
          type: 'String'
        }
      ]
    },
    {
      name: 'createBeneficiary',
      documentation: 'Create a new beneficiary',
      async: true,
      type: 'net.nanopay.fx.afex.CreateBeneficiaryResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.CreateBeneficiaryRequest'
        }
      ]
    },
    {
      name: 'updateBeneficiary',
      documentation: 'Update an existing beneficiary record',
      async: true,
      type: 'net.nanopay.fx.afex.UpdateBeneficiaryResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.UpdateBeneficiaryRequest'
        }
      ]
    },
    {
      name: 'disableBeneficiary',
      documentation: 'Disable an existing beneficiary record by VendorID',
      async: true,
      type: 'String',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.DisableBeneficiaryRequest'
        }
      ]
    },
    {
      name: 'findBeneficiary',
      documentation: 'Search for beneficiary using unique VendorId',
      async: true,
      type: 'net.nanopay.fx.afex.FindBeneficiaryResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.FindBeneficiaryRequest'
        }
      ]
    },
    {
      name: 'findBankByNationalID',
      documentation: 'Search for bank details relating to a bank national ID',
      async: true,
      type: 'net.nanopay.fx.afex.FindBankByNationalIDResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.FindBankByNationalIDRequest'
        }
      ]
    },
    {
      name: 'getValueDate',
      async: true,
      type: 'String',
      args: [
        {
          type: 'String',
          name: 'currencyPair'
        },
        {
          type: 'String',
          name: 'valueType'
        }
      ]
    },
    {
      name: 'getRate',
      documentation: 'Request a rate for a specified currency pair',
      async: true,
      type: 'net.nanopay.fx.afex.GetRateResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.GetRateRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'getQuote',
      documentation: 'Get quote',
      async: true,
      type: 'net.nanopay.fx.afex.Quote',
      args: [
        {
          type: 'net.nanopay.fx.afex.GetQuoteRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'createTrade',
      documentation: 'Create a trade or outright forward to convert from one currency to another',
      async: true,
      type: 'net.nanopay.fx.afex.CreateTradeResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CreateTradeRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'checkTradeStatus',
      documentation: 'retrieve trade details',
      async: true,
      type: 'net.nanopay.fx.afex.CheckTradeStatusResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CheckTradeStatusRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'createPayment',
      documentation: 'Create scheduled payment',
      async: true,
      type: 'net.nanopay.fx.afex.CreatePaymentResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CreatePaymentRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'checkPaymentStatus',
      documentation: 'retrieve payment details',
      async: true,
      type: 'net.nanopay.fx.afex.CheckPaymentStatusResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CheckPaymentStatusRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'getTradeConfirmation',
      documentation: 'retreives trade confirmatiom PDF for a trade',
      async: true,
      type: 'byte[]',
      args: [
        {
          type: 'net.nanopay.fx.afex.GetConfirmationPDFRequest',
          name: 'confirmationPDFRequest'
        }
      ]
    }
  ]
});
