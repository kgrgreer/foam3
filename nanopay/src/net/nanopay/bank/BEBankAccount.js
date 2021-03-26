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
  name: 'BEBankAccount',
  label: 'Belgium',
  extends: 'net.nanopay.bank.EUBankAccount',

  mixins: [ 'net.nanopay.bank.BankAccountValidationMixin' ],

  documentation: 'Belgium bank account information.',

  javaImports: [
    'foam.core.ValidationException',
    'foam.util.SafetyUtil'
  ],

  constants: [
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      value: /^\d{3}$/
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      value: /^\d{7}$/
    }
  ],

  properties: [
    {
      name: 'country',
      value: 'BE',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'EUR',
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/belgium.svg',
      visibility: 'RO'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'bankRoutingCode',
      javaPostSet: `
        if ( val != null && INSTITUTION_NUMBER_PATTERN.matcher(val).matches() ) {
          clearInstitution();
          setInstitutionNumber(val);
        }
      `
    }
  ]
});
