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
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingCallbackPage',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'quickbooksService',
    'user',
    'xeroService',
    'ctrl',
    'stack',
    'accountingIntegrationUtil'
  ],

  exports: [
    'bankMatched'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'foam.u2.LoadingSpinner',
    'foam.u2.dialog.Popup'
  ],

  css: `
  ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: /*%GREY5%*/ #f5f7fa;
    }
  .net-nanopay-accounting-ui-AccountingCallbackPage {
      margin: auto;
      text-align: center;
    }
  ^ .title {
    font-size: 32px;
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: /*%BLACK%*/ #1e1f21;
  }

  ^ .ablii-accounting-software-icon {
    height: 44px;
    width: 44px;
    vertical-align: middle;
  }

  ^ .plus-icon {
    margin: 0px 16px 0px 16px;
    display: inline-block;
  }
  ^ .loading-container {
    width: 504px;
    height: 150px;
    text-align: left;
    display: inline-block;
  }

  `,

  properties: [
    {
      name: 'bankMatchingLogo'
    },
    {
      name: 'abliiBankData',
      factory: function() {
        var dao = this.user.accounts.where(
          this.OR(
            this.INSTANCE_OF(this.CABankAccount),
            this.INSTANCE_OF(this.USBankAccount)
          )
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      name: 'bankMatched',
      type: 'Boolean',
      value: false
    },
    {
      name: 'doSync',
      type: 'Boolean',
      value: false
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      let icon;
      if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
         icon = 'images/xero.png';
      } else if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        icon = 'images/quickbooks.png';
      }

      // display loading icon
      this
        .start().addClass(this.myClass())
          .start()
            .addClass('loading-container')
            .start('h1').addClass('title')
              .add('Retrieving data...')
            .end()
            .start()
              .addClass('image-container')
              .start('img')
                .addClass('ablii-accounting-software-icon')
                .attrs({ src: 'images/ablii-logo.svg' })
              .end()
              .start('p')
                .addClass('plus-icon')
                .add('+')
              .end()
              .start('img')
                .addClass('ablii-accounting-software-icon')
                .attrs({ src: icon })
              .end()
            .end()
          .end()
        .end();

      if ( this.doSync ) {
        let result = await this.accountingIntegrationUtil.doSync(this, true);
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage1',
          reportResult: result
        });
        return;
      }

      let connectedBank = await this.countConnectedBank();
      if ( connectedBank.value === 0 ) {
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingBankMatching'
        });
      } else {
        let result = await this.accountingIntegrationUtil.doSync(this, true);
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage1',
          reportResult: result
        });
      }
    },

    async function countConnectedBank() {
      return await this.user.accounts.where(
        this.AND(
          this.OR(
            this.INSTANCE_OF(this.CABankAccount),
            this.INSTANCE_OF(this.USBankAccount)
          ),
          this.NEQ(this.BankAccount.INTEGRATION_ID, '')
        )
      ).select(this.COUNT());
    }
  ]
});
