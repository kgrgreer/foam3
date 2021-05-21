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

foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'InstructionCombinedRequest',

  documentation: 'Represents a disbursement instruction request',

  properties: [
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Merchant unique instruction number'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.fx.lianlianpay.model.InstructionType',
      name: 'fundsType',
      documentation: 'Funds type'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      documentation: 'Source currency'
    },
    {
      class: 'Float',
      name: 'sourceAmount',
      documentation:
        `Source currency amount
         Format of the source amount varies according to different currencies,
         and should accurate to the smallest unit of this currency. For example,
         if the source currency is USD, the format is 12.31;
         if the source of the currency is JPY, the format is 12.`
    },
    {
      class: 'String',
      name: 'targetCurrency',
      documentation: 'Disbursement currency, only support CNY for now',
      value: 'CNY'
    },
    {
      class: 'Float',
      name: 'targetAmount',
      documentation: 'Target currency amount'
    },
    {
      class: 'String',
      name: 'payeeCompanyName',
      documentation: 'Company name of payee, only support in Simplified Chinese or English'
    },
    {
      class: 'String',
      name: 'payeeContactNumber',
      documentation: 'Contact phone number of payee company'
    },
    {
      class: 'String',
      name: 'payeeOrganizationCode',
      documentation:
        `Organization code of payee company. Only 9 or 10 characters allowed.
         9 characters consist of digits and uppercase letters.
         10 characters consist of digits and uppercase letters, with a hyphen as the 9th character, e.g. 12345678-X.`
    },
    {
      class: 'String',
      name: 'payeeSocialCreditCode',
      documentation:
        `Unified social credit code of payee company
         18 characters consist of digits and uppercase letters.`
    },
    {
      class: 'String',
      name: 'payeeEmailAddress',
      documentation: 'Company email address',
      required: false
    },
    {
      class: 'Int',
      name: 'payeeBankName',
      documentation: 'Payee bank, column “#”'
    },
    {
      class: 'String',
      name: 'payeeBankBranchName',
      documentation: 'Bank branch name in Simplified Chinese or CNAPS Code'
    },
    {
      class: 'String',
      name: 'payeeBankAccount',
      documentation: 'Payee bank account. Sensitive information, should be encrypted using AES.'
    },
    {
      class: 'String',
      name: 'payerId',
      documentation: 'Unique id of the payer in merchant system'
    },
    {
      class: 'String',
      name: 'payerName',
      documentation: 'Name of the payer, corporate name or name of an individual'
    },
    {
      class: 'String',
      name: 'tradeCode',
      documentation: 'Code for trade type'
    },
    {
      class: 'String',
      name: 'memo',
      documentation: 'Reference message passed from payer or merchant to indicate payer name, payment purpose and etc.',
      required: false
    }
  ]
});
