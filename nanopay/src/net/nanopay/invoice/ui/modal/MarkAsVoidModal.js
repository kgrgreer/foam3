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
        'net.nanopay.invoice.model.PaymentStatus'
    ],

    messages: [
        { name: 'TITLE', message: 'Mark as void?' },
        { name: 'MSG1', message: 'Are you sure you want to void this invoice?'},
        { name: 'MSG2', message: 'Once this invoice is voided, it cannot be edited.' },
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
            view: {
                class: 'foam.u2.tag.TextArea',
                placeholder: 'i.e. Why is it voided?',
                rows: 4,
                cols: 35
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
                            .add('Note:')
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