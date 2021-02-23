/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.INTERFACE({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFX',

  documentation: 'Interface to the AscendantFX service',

  methods: [
    {
      name: 'getQuote',
      documentation: 'Get quote',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.GetQuoteResult',
      args: [
        {
          type: 'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
          name: 'request',
        }
      ]
    },
    {
      name: 'acceptQuote',
      documentation: 'To accept quote',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.AcceptQuoteResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest'
        }
      ]
    },
    {
      name: 'submitDeal',
      documentation: 'To submit deal',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.SubmitDealResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.SubmitDealRequest'
        }
      ]
    },
    {
      name: 'submitIncomingDeal',
      documentation: 'For submitting incoming deals by our partners for their end users/clients',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.SubmitIncomingDealResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.SubmitIncomingDealRequest'
        }
      ]
    },
    {
      name: 'getAccountBalance',
      documentation: 'Get AFX holding account balance',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.GetAccountBalanceResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.GetAccountBalanceRequest'
        }
      ]
    },
    {
      name: 'validateIBAN',
      documentation: 'Validates the IBAN',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.ValidateIBANResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.ValidateIBANRequest'
        }
      ]
    },
    {
      name: 'addPayee',
      documentation: 'To add a new payee',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        }
      ]
    },
    {
      name: 'updatePayee',
      documentation: 'To update a given payee\'s information',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        }
      ]
    },
    {
      name: 'deletePayee',
      documentation: 'To delete a given payee',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        }
      ]
    },
    {
      name: 'getPayeeInfo',
      documentation: 'Get information for a given payee',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.GetPayeeInfoResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.GetPayeeInfoRequest'
        }
      ]
    },
    {
      name: 'postDeal',
      documentation: 'Posting submitted deals back into your ERP or Account Platform',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.PostDealResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.PostDealRequest'
        }
      ]
    },
    {
      name: 'postDealConfirmation',
      documentation: 'Posting submitted deals back into your ERP or Account Platform',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.PostDealConfirmationResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.PostDealConfirmationRequest'
        }
      ]
    },
    {
      name: 'validatePayeeInfo',
      documentation: 'Validate existing payee record through our trademark Payee Intelligence engine to look for completeness of information provided',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.PayeeInfoValidationResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.PayeeInfoValidationRequest'
        }
      ]
    },
    {
      name: 'getAccountActivity',
      documentation: 'Returns ledger of the holding account',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.GetAccountActivityResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.GetAccountActivityRequest'
        }
      ]
    },
    {
      name: 'checkIncomingFundsStatus',
      documentation: 'Check if the coming funds has been credited to your holding account',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckRequest'
        }
      ]
    },
    {
      name: 'getQuoteTBA',
      documentation: 'Get a quote when transferring funds from one holding account for a given currency to another account for a different currency',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.GetQuoteTBAResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.GetQuoteTBARequest'
        }
      ]
    },
    {
      name: 'acceptAndSubmitDealTBA',
      documentation: 'Submit the request to transfer funds from holding account to the other based on the rate provided in GetQuoteTBA',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.AcceptAndSubmitDealTBAResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest'
        }
      ]
    },
    {
      name: 'getIncomingPaymentInstruction',
      documentation: 'For Partners who would like to provide instructions to their end users/customers for a payment being sent to the US or CAD',
      async: true,
      type: 'net.nanopay.fx.ascendantfx.model.IncomingPaymentInstructionResult',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.ascendantfx.model.IncomingPaymentInstructionRequest'
        }
      ]
    }
  ]
});
