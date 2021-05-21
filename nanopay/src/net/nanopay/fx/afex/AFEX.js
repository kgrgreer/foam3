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
  package: 'net.nanopay.fx.afex',
  name: 'AFEX',

  documentation: 'Interface to the AFEX service',

  methods: [
    {
      name: 'getToken',
      documentation: 'Get token',
      async: true,
      type: 'net.nanopay.fx.afex.Token',
      args: [
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'onboardAFEXClient',
      documentation: 'Create a new AFEX client account',
      async: true,
      type: 'net.nanopay.fx.afex.OnboardAFEXClientResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.OnboardAFEXClientRequest'
        },
        {
          name: 'spid',
          type: 'String'
        },
        {
          name: 'requestType',
          type: 'net.nanopay.fx.afex.AccountEntityType'
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
        },
        {
          name: 'spid',
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
        },
        {
          name: 'spid',
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          type: 'String',
          name: 'businessApiKey'
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'getSpotRate',
      documentation: 'Request a SPOT rate for a specified currency pair',
      async: true,
      type: 'net.nanopay.fx.afex.GetRateResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.GetRateRequest',
          name: 'request'
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
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
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'directDebitEnrollment',
      documentation: 'enable enrollment of an account for Direct Debit settlement.',
      async: true,
      type: 'String',
      args: [
        {
          type: 'net.nanopay.fx.afex.DirectDebitEnrollmentRequest',
          name: 'directDebitRequest'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'directDebitUnenrollment',
      documentation: 'enable enrollment of an account for Direct Debit settlement.',
      async: true,
      type: 'String',
      args: [
        {
          type: 'net.nanopay.fx.afex.DirectDebitUnenrollmentRequest',
          name: 'directDebitUnenrollmentRequest'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'addCompanyOfficer',
      documentation: 'This method is used to add a Company Officer to an existing Corporate Client accoun.',
      async: true,
      type: 'String',
      args: [
        {
          type: 'net.nanopay.fx.afex.AddCompanyOfficerRequest',
          name: 'addCompanyOfficerRequest'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'createFundingBalance',
      documentation: 'This method is used to create a funding balance so AFEX client can receive instant payment',
      async: true,
      type: 'net.nanopay.fx.afex.CreateFundingBalanceResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CreateFundingBalanceRequest',
          name: 'request'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'getFundingBalance',
      documentation: 'Get funding balance',
      async: true,
      type: 'net.nanopay.fx.afex.FundingBalance',
      args: [
        {
          class: 'String',
          name: "clientAPIKey"
        },
        {
          type: 'String',
          name: 'currency'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'createInstantBeneficiary',
      documentation: 'This method is used to create an Instant Beneficiary',
      async: true,
      type: 'net.nanopay.fx.afex.CreateInstantBeneficiaryResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CreateInstantBeneficiaryRequest',
          name: 'request'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'validateInstantBenefiaryRequest',
      documentation: 'This method is used to validate an Instant Beneficiary request to see its details are valid',
      async: true,
      type: 'net.nanopay.fx.afex.ValidateInstantBenefiaryResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.ValidateInstantBenefiaryRequest',
          name: 'request'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ]
    },
    {
      name: 'isiban',
      documentation: 'This method is used to validate a given IBAN',
      async: true,
      type: 'net.nanopay.fx.afex.IsIbanResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.IsIbanRequest',
          name: 'isIbanRequest'
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    }
  ]
});
