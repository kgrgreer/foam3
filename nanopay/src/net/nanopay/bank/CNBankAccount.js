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
  name: 'CNBankAccount',
  label: 'China',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'China bank account information.',

  properties: [
    {
      name: 'country',
      value: 'CN',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/china.png',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountInformation',
      gridColumns: 12,
      value: 'CNY',
    },
    {
      name: 'accountNumber',
      updateVisibility: 'RO',
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str, obj) {
        if ( ! str ) return;
        var displayAccountNumber = obj.mask(str);
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{12}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'institutionNumber',
      updateVisibility: 'RO',
      section: 'accountInformation',
      validateObj: function(institutionNumber) {
        var regex = /^[A-z0-9a-z]{4}$/;

        if ( institutionNumber === '' ) {
          return this.INSTITUTION_NUMBER_REQUIRED;
        } else if ( ! regex.test(institutionNumber) ) {
          return this.INSTITUTION_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'iban',
      required: false,
      visibility: 'HIDDEN',
      validateObj: function(iban) {
      },
      javaPostSet: `
      `
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
