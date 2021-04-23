/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.bank',
  name: 'BankAccountValidationService',

  documentation: 'Bank account validation service interface.',

  methods: [
    {
      name: 'convertToRoutingCode',
      documentation: 'Convert a bank code or a SWIFT/BIC to the routing code.',
      type: 'String',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'countryCode', type: 'String' },
        { name: 'nationalId', type: 'String' }
      ]
    },
    {
      name: 'convertToSwiftCode',
      documentation: 'Convert Iban to SWIFT/BIC.',
      type: 'String',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'countryCode', type: 'String' },
        { name: 'iban', type: 'String' }
      ]
    },
    {
      name: 'convertToIbanAndSwiftCode',
      documentation: 'Convert Bank info to Iban and SWIFT/BIC.',
      type: 'String[]',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'countryCode', type: 'String' },
        { name: 'nationalId', type: 'String' },
        { name: 'accountNumber', type: 'String' },
        { name: 'allowedCodes', type: 'List' }
      ]
    }
  ]
});
