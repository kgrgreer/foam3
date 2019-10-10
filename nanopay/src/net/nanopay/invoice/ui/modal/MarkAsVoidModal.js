foam.CLASS({
    package: 'net.nanopay.invoice.ui.modal',
    name: 'MarkAsVoidModal',
    extends: 'foam.u2.View',

    documentation: 'Modal for markig invoice as void',

    imports: [
        'invoiceDAO',
        'notify'
    ],

    requires: [
        'foam.u2.tag.TextArea',
        'net.nanopay.invoice.model.PaymentStatus'
    ],

    messages: [
        { name: 'TITLE', message: 'Mark as void?' },
        { 
            name: 'MSG1', 
            message: 'Are you sure you want to void this invoice?'},
            { 
                name: 'MSG2', 
                message: 'Once this invoice is voided, it cannot be edited.' },
        { name: 'SUCCESS_MESSAGE', message: 'Invoice has been marked as voided.'},
        { name: 'NOTE_HINT', message: 'i.e. Why is it voided?'},
        { name: 'VOID_SUCCESS', message: 'Invoice successfully voided.'},
        { name: 'VOID_ERROR', message: 'Invoice could not be voided.'}        
    ],

    css: `
    ^ {
        max-width: 500vw;
        margin: auto;
      }
    //     ^ .size {
    //         width: 330px;
    //   }
    //   ^ .one-col {
    //     margin: 20px;
    //   }
    //   ^ .padding {
    //       padding: 0px 25px;
    //   }
    //   ^ .note-size {
    //     margin-left: 20px;
    //     padding: 10px 5px;
    //     width: 90%;
    //   }
    `,

    properties: [
        {
            class: 'String',
            name: 'note',
            view: {
                class: 'foam.u2.TextField',
                placeholder: 'i.e. Why is it voided?'
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
                .start().addClass('size')
                .start('h2').addClass('padding')
                    .add(this.TITLE)
                .end()
                .start().addClass('padding')
                    .add(this.MSG1)
                    .add(this.MSG2)
                .end()
                .start().add('Note:').end().start().add(this.NOTE).end()
                .tag({
                    class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
                    back: this.CANCEL,
                    next: this.VOID_METHOD
                })
            .endContext()
            .end();
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
                this.invoice.paymentMethod = this.PaymentStatus.VOID;
                this.invoice.note = this.note ? this.invoice.note + ' On Void Note: ' + this.note : this.invoice.note;
                this.invoiceDAO.put(this.invoice).then((invoice) => {
                  if (invoice.paymentMethod == this.PaymentStatus.VOID) {
                    this.notify(this.VOID_SUCCESS, 'success');
                    X.closeDialog();
                  }
                }).catch((err) => {
                  if ( err ) this.notify(this.VOID_ERROR, 'error');
                  X.closeDialog();
                });
            }
        }
    ]
});