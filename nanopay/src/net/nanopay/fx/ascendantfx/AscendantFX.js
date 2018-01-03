foam.INTERFACE({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFX',

  documentation: 'Interface to the AscendantFX service',

  methods: [
    {
      name: 'getQuote',
      documentation: 'Get quote',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.GetQuoteResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.GetQuoteRequest'
        }
      ]
    },
    {
      name: 'acceptQuote',
      documentation: 'To accept quote',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.AcceptQuoteResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest'
        }
      ]
    },
    {
      name: 'submitDeal',
      documentation: 'To submit deal',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.SubmitDealResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.SubmitDealRequest'
        }
      ]
    },
    {
      name: 'submitIncomingDeal',
      documentation: 'For submitting incoming deals by our partners for their end users/clients',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.SubmitIncomingDealResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.SubmitIncomingDealRequest'
        }
      ]
    },
    {
      name: 'getAccountBalance',
      documentation: 'Get AFX holding account balance',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.GetAccountBalanceResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.GetAccountBalanceRequest'
        }
      ]
    },
    {
      name: 'validateIBAN',
      documentation: 'Validates the IBAN',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.ValidateIBANResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.ValidateIBANRequest'
        }
      ]
    },
    {
      name: 'addPayee',
      documentation: 'To add a new payee',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        }
      ]
    },
    {
      name: 'updatePayee',
      documentation: 'To update a given payee\'s information',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        }
      ]
    },
    {
      name: 'deletePayee',
      documentation: 'To delete a given payee',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        }
      ]
    },
    {
      name: 'getPayeeInfo',
      documentation: 'Get information for a given payee',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.GetPayeeInfoResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.GetPayeeInfoRequest'
        }
      ]
    },
    {
      name: 'postDeal',
      documentation: 'Posting submitted deals back into your ERP or Account Platform',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.PostDealResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.PostDealRequest'
        }
      ]
    },
    {
      name: 'postDealConfirmation',
      documentation: 'Posting submitted deals back into your ERP or Account Platform',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.PostDealConfirmationResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.PostDealConfirmationRequest'
        }
      ]
    },
    {
      name: 'validatePayeeInfo',
      documentation: 'Validate existing payee record through our trademark Payee Intelligence engine to look for completeness of information provided',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.PayeeInfoValidationResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.PayeeInfoValidationRequest'
        }
      ]
    },
    {
      name: 'getAccountActivity',
      documentation: 'Returns ledger of the holding account',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.GetAccountActivityResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.GetAccountActivityRequest'
        }
      ]
    },
    {
      name: 'checkIncomingFundsStatus',
      documentation: 'Check if the coming funds has been credited to your holding account',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckRequest'
        }
      ]
    },
    {
      name: 'getQuoteTBA',
      documentation: 'Get a quote when transferring funds from one holding account for a given currency to another account for a different currency',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.GetQuoteTBAResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.GetQuoteTBARequest'
        }
      ]
    },
    {
      name: 'acceptAndSubmitDealTBA',
      documentation: 'Submit the request to transfer funds from holding account to the other based on the rate provided in GetQuoteTBA',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.AcceptAndSubmitDealTBAResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest'
        }
      ]
    },
    {
      name: 'getIncomingPaymentInstruction',
      documentation: 'For Partners who would like to provide instructions to their end users/customers for a payment being sent to the US or CAD',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.ascendantfx.model.IncomingPaymentInstructionResult',
      args: [
        {
          name: 'request',
          javaType: 'net.nanopay.fx.ascendantfx.model.IncomingPaymentInstructionRequest'
        }
      ]
    }
  ]
});
