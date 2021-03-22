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
  name: 'GBBankAccount',
  label: 'United Kingdom',
  extends: 'net.nanopay.bank.EUBankAccount',

  mixins: [ 'net.nanopay.bank.BankAccountValidationMixin' ],

  documentation: 'United Kingdom/Great Britain bank account information.',

  javaImports: [
    'foam.core.ValidationException',
    'foam.nanos.iban.IBANInfo',
    'foam.nanos.iban.ValidationIBAN',
    'foam.util.SafetyUtil'
  ],

  constants: [
    {
      name: 'BRANCH_ID_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{6}$/; }
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{8}$/; }
    },
  ],

  properties: [
    {
      name: 'country',
      value: 'GB',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/greatBritain.svg',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'GBP',
    },
    {
      name: 'iban',
      label: 'International Bank Account Number (IBAN)',
      section: 'accountInformation',
      documentation: `Standard international numbering system developed to
          identify an overseas bank account.`,
      updateVisibility: 'RO',
      validateObj: function(iban, branchId, accountNumber, institutionNumber, country) {
        if ( ! ( (branchId && this.BRANCH_ID_PATTERN.test(branchId)) &&
             (accountNumber && this.ACCOUNT_NUMBER_PATTERN.test(accountNumber)) )
        ) {
          if ( ! iban )
            return this.IBAN_REQUIRED;

          if ( iban && country !== iban.substring(0, 2) ) {
            return this.IBAN_COUNTRY_MISMATCHED;
          }

          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

          if ( ibanMsg && ibanMsg != 'passed')
            return ibanMsg;
        }
      }
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'bankRoutingCode',
      javaPostSet: `
        if ( val != null && BRANCH_ID_PATTERN.matcher(val).matches() ) {
          clearBranch();
          setBranchId(val);
        }
      `
    }
  ],

  methods: [
    {
      name: 'getApiAccountNumber',
      javaCode: `
        return getAccountNumber();
      `
    }
  ]
});
