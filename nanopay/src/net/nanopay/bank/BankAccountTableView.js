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
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BRBankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'subject'
  ],

  css: `
  ^ .foam-u2-view-TableView-tr div {
    display: inline-block;
  }
`,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'customDAO',
      factory: function() {
        var dao = this.subject.user.accounts.where(
          this.INSTANCE_OF(this.BankAccount)
        ).orderBy(this.BankAccount.CREATED);
        dao.of = 'net.nanopay.bank.BankAccount';
        return dao;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .start().addClass(this.myClass())
          .start({
            class: 'foam.u2.view.ScrollTableView',
            enableDynamicTableHeight: false,
            editColumnsEnabled: false,
            columns: [
              'name',
              'summary',
              'flagImage',
              'denomination',
              'status',
              'isDefault'
            ],
            data$: this.customDAO$,
            dblClickListenerAction: this.dblclick
          }).style({
            'padding-bottom': '0!important'
          })
          .end()
        .end();
    },

    async function dblclick() {
      if ( this.selection) {
        this.__subContext__.accountDAO.cmd_(this, foam.dao.PurgeRecordCmd.create({ id: this.selection.id }));
        var account = await this.__subContext__.accountDAO.find(this.selection.id);
        var popupView = account.status === net.nanopay.bank.BankAccountStatus.UNVERIFIED && net.nanopay.bank.CABankAccount.isInstance(account) ?
          foam.u2.dialog.Popup.create({}, this).tag({
            class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
            bank: account
          }) :
          net.nanopay.sme.ui.SMEModal.create({}, this).addClass('bank-account-popup')
            .startContext({ controllerMode: foam.u2.ControllerMode.EDIT })
              .tag({
                class: 'net.nanopay.account.ui.BankAccountWizard',
                data: account,
                useSections: ['clientAccountInformation', 'pad'],
                config: {
                  id: { updateVisibility: 'HIDDEN' },
                  summary: { updateVisibility: 'HIDDEN' }
                }
              })
            .endContext();
        this.add(popupView);
      }
    }
  ]
});