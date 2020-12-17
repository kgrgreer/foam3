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
  package: 'net.nanopay.tx.ui',
  name: 'TransactionDetailView',
  extends: 'foam.u2.View',

  documentation: 'Transaction detail view.',

  properties: [
    'data'
  ],

  css: `
    ^ {
      width: 992px;
      margin: auto;
    }
    ^ .net-nanopay-tx-ui-SingleItemView{
      margin-top: 25px;
    }
    ^ .foam-u2-ActionView-backAction{
      border-radius: 2px;
      border: 1px solid lightgrey;
      // background-color: rgba(164, 179, 184, 0.1);
    }
    ^ .inline{
      float: right;
      margin-right: 30px;
    }
  `,

  methods: [
    function initE() {

      this
      .addClass(this.myClass())
      .start(this.BACK_ACTION).end()
      .start().addClass('inline')
        .tag(this.EXPORT_BUTTON)
      .end()
      .tag({ class: 'net.nanopay.tx.ui.SingleItemView', data: this.data })
      .start('h2').addClass('light-roboto-h2').style({ 'margin-bottom': '0px'})
          .add('Note:')
      .end()
      .start('br').end()
      .start('h2').addClass('light-roboto-h2').style({ 'font-size': '14px'})
        .add(this.data.notes)
      .end();
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X) {
        X.stack.back();
      }
    },
    {
      name: 'exportButton',
      label: 'Export',
      icon: 'images/ic-export.png',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.ExportModal', exportObj: X.data }));
      }
    }
  ]
});
