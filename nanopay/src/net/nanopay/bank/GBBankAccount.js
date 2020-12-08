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
  label: 'United Kingdom Bank',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'United Kingdom/Great Britain bank account information.',

  constants: [
    {
      name: 'SORT_CODE_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{6}$/; }
    },
    {
      name: 'ACCOUNT_NUMBER_PATTERN',
      type: 'Regex',
      factory: function() { return /^[0-9]{8}$/; }
    },
    {
      name: 'INSTITUTION_NUMBER_PATTERN',
      type: 'Regex',
      factory: function() { return /^[A-z0-9a-z]{4}$/; }
    }
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
      validateObj: function(iban, sortCode, accountNumber, institutionNumber) {
        if ( ! ( (sortCode && this.SORT_CODE_PATTERN.test(sortCode)) &&
             (accountNumber && this.ACCOUNT_NUMBER_PATTERN.test(accountNumber)) &&
             (institutionNumber && this.INSTITUTION_NUMBER_PATTERN.test(institutionNumber)) )
        ) {
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

          if ( ! ibanMsg )
            return this.IBAN_REQUIRED;

          if ( ibanMsg && ibanMsg != 'passed')
            return ibanMsg;
        }
      }
    },
    {
      class: 'String',
      name: 'sortCode',
      label: 'Sort Code',
      section: 'accountInformation',
      updateVisibility: 'RO',
      validateObj: function(sortCode, iban) {
        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( sortCode === '' ) {
            return this.SORT_CODE_REQUIRED;
          } else if ( ! this.SORT_CODE_PATTERN.test(sortCode) ) {
            return this.SORT_CODE_INVALID;
          }
        }
      }
    },
    {
      name: 'accountNumber',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 4, str.length)
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber, iban) {
        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( accountNumber === '' ) {
            return this.ACCOUNT_NUMBER_REQUIRED;
          } else if ( ! this.ACCOUNT_NUMBER_PATTERN.test(accountNumber) ) {
            return this.ACCOUNT_NUMBER_INVALID;
          }
        }
      }
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'institutionNumber',
      updateVisibility: 'RO',
      validateObj: function(institutionNumber, iban) {
        if ( iban )
          var ibanMsg = this.ValidationIBAN.create({}).validate(iban);

        if ( ! iban || (iban && ibanMsg != 'passed') ) {
          if ( institutionNumber === '' ) {
            return this.INSTITUTION_NUMBER_REQUIRED;
          } else if ( ! this.INSTITUTION_NUMBER_PATTERN.test(institutionNumber) ) {
            return this.INSTITUTION_NUMBER_INVALID;
          }
        }
      }
    },
    {
      name: 'branchId',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'getRoutingCode',
      javaCode: `
        return getSortCode();
      `
    }
  ]
});
