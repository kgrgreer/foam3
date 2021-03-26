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
  package: 'net.nanopay.invoice.ui.modal',
  name: 'MarkAsVoidModal',
  extends: 'foam.u2.View',

  documentation: 'Modal for marking invoice as void.',

  imports: [
    'invoiceDAO',
    'notify'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  messages: [
    { name: 'TITLE', message: 'Mark as void?' },
    { name: 'MSG1', message: 'Are you sure you want to void this invoice?' },
    { name: 'MSG2', message: 'Once this invoice is voided, it cannot be edited.' },
    { name: 'SUCCESS_MESSAGE', message: 'Invoice has been marked as voided' },
    { name: 'NOTE_LABEL', message: 'Notes' },
    { name: 'NOTE_HINT', message: 'i.e. Why is it voided?' },
    { name: 'VOID_SUCCESS', message: 'Invoice successfully voided' },
    { name: 'VOID_ERROR', message: 'Invoice could not be voided' }
  ],

  css: `
    ^ {
      max-width: 500vw;
      margin: auto;
    }
    ^ .size {
      max-width: 330px;
    }
    ^ .one-col {
      margin: 20px;
    }
    ^ .padding-24 {
      padding: 24px 24px;
    }
    ^ .margin-bottom-24 {
      margin: 0;
      margin-bottom: 24px;
      width: 270px;
      opacity: 0.8;
    }
    ^ .margin-bottom-8 {
      margin: 0px;
      margin-bottom: 8px;
    }
    ^ .input-note {
      width: 100%;
    }
  `,
  properties: [
    {
      class: 'String',
      name: 'note',
      view: function(args, X) {
        return foam.u2.tag.TextArea.create({
          placeholder: X.data.NOTE_HINT,
          rows: 4,
          cols: 35
        });
      }
    },
    'invoice'
  ],
  methods: [
    function initE() {
      this.SUPER();

      this
      .addClass(this.myClass())
      .startContext({ data: this })
        .start().addClass('padding-24').addClass('size')
          .start()
            .start('h2')
              .addClass('margin-bottom-8')
              .add(this.TITLE)
            .end()
            .start()
              .addClass('margin-bottom-24')
              .start('span')
                .add(this.MSG1)
              .end()
              .br()
              .start('span')
                .add(this.MSG2)
              .end()
            .end()
            .start()
              .addClass('label')
              .addClass('margin-bottom-8')
              .add(this.NOTE_LABEL)
            .end()
            .start(this.NOTE).addClass('input-note').end()
          .end()
        .end()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.CANCEL,
          next: this.VOID_METHOD
        })
      .endContext();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'voidMethod',
      label: 'Void',
      code: function(X) {
        this.invoice.draft = false
        this.invoice.paymentMethod = this.PaymentStatus.VOID;
        // if void note is provided, append it to the end of the existing invoice note
        if ( this.note ) {
          this.invoice.note = `${this.invoice.note} ${this.invoice.ON_VOID_NOTE}${this.note}`;
        }
        this.invoiceDAO.put(this.invoice).then((invoice) => {
         if ( invoice.paymentMethod == this.PaymentStatus.VOID ) {
          X.closeDialog();
          if ( X.currentMenu.id == 'sme.quickAction.send' || X.currentMenu.id == 'mainmenu.dashboard' ) {
            X.stack.push({
              class: 'net.nanopay.sme.ui.MoneyFlowRejectView',
              invoice: this.invoice
            });
          } else {
            this.notify(this.VOID_SUCCESS, '', this.LogLevel.INFO, true);
          }
         }
        }).catch((err) => {
         if ( err ) this.notify(this.VOID_ERROR, '', this.LogLevel.ERROR, true);
         X.closeDialog();
        });
      }
    }
  ]
});
