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
  package: 'net.nanopay.bank.ui',
  name: 'BankAccountSelectionView',
  extends: 'foam.u2.View',

  css: `
    ^container {
      display: flex;
      align-items: center;
    } 
    ^container img {
      margin-right: 8px;
      width: 24px;
    }
  `,

  requires: [
    'net.nanopay.bank.BankAccount'
  ],

  messages: [
    {
      name: 'DEFAULT_LABEL',
      message: 'Select bank account'
    }
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'fullObject'
    }
  ],

  methods: [
    function initE() {
      return this.attrs({ name: "bankAccountSelectionView" })
        .addClass(this.myClass())
        .callIfElse(
          this.data,
          function() {
            this.add(this.fullObject$.map((account) => {
              if ( account ) {
                return this.E()
                  .addClass(this.myClass('container'))
                  .start('img')
                    .attrs({ src: account.flagImage })
                  .end()
                  .add(`${account.name} ${this.BankAccount.mask(account.accountNumber)} - ${account.denomination}`);
              }
            }));
          },
          function() {
            this.add(this.DEFAULT_LABEL);
          }
        );
    }
  ]
});
