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
  name: 'IEBankAccount',
  label: 'Ireland Bank',
  extends: 'net.nanopay.bank.EUBankAccount',

  documentation: 'Ireland bank account information.',

  constants: [
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
      value: 'IE',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/ireland.svg',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'EUR',
    },
    {
      name: 'accountNumber',
      updateVisibility: 'RO',
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
      name: 'desc',
      visibility: 'HIDDEN'
    },
    {
      name: 'branchId',
      visibility: 'HIDDEN'
    }
  ]
});
