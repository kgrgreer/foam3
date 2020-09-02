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
  name: 'HKBankAccount',
  label: 'Hong Kong Bank Account',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'Hong Kong bank account information.',

  properties: [
    {
      name: 'country',
      value: 'HK',
      visibility: 'RO'
    },
    {
      name: 'flagImage',
      label: '',
      value: 'images/flags/hong-kong.svg',
      visibility: 'RO'
    },
    {
      name: 'swiftCode',
      label: 'SWIFT/BIC',
      updateVisibility: 'RO',
      section: 'accountDetails',
      validateObj: function(swiftCode) {
        var regex = /^[A-z0-9a-z]{8,11}$/;

        if ( swiftCode === '' ) {
          return this.SWIFT_CODE_REQUIRED;
        } else if ( ! regex.test(swiftCode) ) {
          return this.SWIFT_CODE_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      label: 'Account No.',
      updateVisibility: 'RO',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567890',
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
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{6,9}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      name: 'bankCode',
      visibility: 'HIDDEN'
    },
    {
      name: 'iban',
      required: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    }
  ]
});
