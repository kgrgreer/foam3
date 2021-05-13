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
  package: 'net.nanopay.bank',
  name: 'AccountDetailModel',

  javaImports: [
    'foam.nanos.iban.ValidationIBAN',
    'foam.nanos.iban.IBANInfo',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution'
  ],

  documentation: 'Canadian Bank account information.',

  messages: [
    { name: 'TRANSIT_NUMBER_REQUIRED', message: 'Transit number required' },
    { name: 'TRANSIT_NUMBER_FORMAT', message: 'Transit number must contain numbers' },
    { name: 'TRANSIT_NUMBER_FIVE', message: 'Transit number must be 5 digits long' }
  ],

  properties: [
    {
      name: 'accountNumber',
      label: 'Account'
    },
    {
      name: 'iban'
    },
    {
      name: 'institutionNumber',
      label: 'Institution',
      documentation: `Provides backward compatibilty for mobile call flow.
          BankAccountInstitutionDAO will lookup the institutionNumber and set the institution property.`,
    },
    {
      name: 'branchId',
      type: 'String',
      label: 'Transit'
    },
    {
      name: 'swiftCode',
      label: 'SWIFT/BIC'
    }
  ]
});
