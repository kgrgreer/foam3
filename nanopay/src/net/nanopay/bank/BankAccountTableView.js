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
  name: 'BankAccountTableView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.Action',
    'foam.log.LogLevel',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.sme.ui.SMEModal'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'ctrl',
    'notify',
    'stack',
    'subject',
    'auth'
  ],

  properties: [
    {
      name: 'editColumnsEnabled',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        var dao = this.subject.user.accounts;
        // .where(
        //   this.OR(
        //     this.INSTANCE_OF(this.CABankAccount),
        //     this.INSTANCE_OF(this.USBankAccount),
        //     this.INSTANCE_OF(this.BRBankAccount)
        //   )
        // );
        dao.of = 'net.nanopay.bank.BankAccount';
        return dao;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      // this.config.dao = this.data;

      this
        .start().addClass(this.myClass())
          .start({
            class: 'foam.u2.view.ScrollTableView',
            enableDynamicTableHeight: false,
            editColumnsEnabled: false,
            columns: [
              this.BankAccount.NAME.clone().copyFrom({
                tableWidth: 168
              }),
              'summary',
              'flagImage',
              'denomination',
              'status',
              'isDefault'
            ],
            data$: this.data$,
            // config$: this.config$,
            // dblClickListenerAction: this.dblclick
          }).end()
        .end();
    },

    // function dblclick() {
    //     if ( this.selection) {
    //       debugger;
    //     }
    // }
  ]
});