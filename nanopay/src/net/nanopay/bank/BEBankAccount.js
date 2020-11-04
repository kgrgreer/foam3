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
  label: 'Belgium Bank Account',
  extends: 'net.nanopay.bank.EUBankAccount',

  documentation: 'Belgium bank account information.',

  properties: [
    {
      name: 'country',
      value: 'BE',
      visibility: 'RO'
    },
    {
      name: 'denomination',
      section: 'accountDetails',
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
      name: 'bankCode',
      label: 'Bank code',
      updateVisibility: 'RO',
      validateObj: function(bankCode) {
        var bankCodeRegex = /^[A-z0-9a-z]{3}$/;

        if ( bankCode === '' ) {
          return this.BANK_CODE_REQUIRED;
        } else if ( ! bankCodeRegex.test(bankCode) ) {
          return this.BANK_CODE_INVALID;
        }
      }
    },
    {
      name: 'accountNumber',
      label: 'Account number',
      updateVisibility: 'RO',
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{7}$/;

        if ( accountNumber === '' ) {
          return this.ACCOUNT_NUMBER_REQUIRED;
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return this.ACCOUNT_NUMBER_INVALID;
        }
      }
    },
    {
      class: 'String',
      name: 'checkDigit',
      section: 'accountDetails',
      label: 'Check Digit',
      updateVisibility: 'RO'
    },
    {
      name: 'desc',
      visibility: 'HIDDEN'
    }
  ]
});
