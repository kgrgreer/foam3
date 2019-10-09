foam.CLASS({
    package: 'net.nanopay.invoice.ui.modal',
    name: 'MarkAsVoidModal',
    // extends: 'foam.u2.Controller',
    extends: 'foam.u2.View',

    documentation: 'Modal for markig invoice as void',

    imports: [
        'invoiceDAO',
        'notify'
    ],

    requires: [
        'net.nanopay.invoice.model.PaymentStatus'//,
        // 'foam.u2.PopupView',
        //'foam.u2.dialog.NotificationMessage'
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

    // css: `
    // ^ {
    //     width: 330px;
    //     padding: 25px;
    //     margin: auto;
    //     font-family: Roboto;
    //   }
    // `,

    properties: [
        {
            class: 'String',
            name: 'note',
            value: 'bla',
            view: { class: 'foam.u2.tag.TextArea', rows: 1, cols: 1 }
        },
        'invoice'
    ],
    methods: [
        function initE() {
            this.SUPER();
            self = this;
            // PaymentStatus = this.PaymentStatus;
            // invoice = this.invoice;
            // invoiceDAO = this.invoiceDAO;
            // notify = this.notify;

            this
            .addClass(this.myClass())
            .start()
                .start('h2')
                    .add(this.TITLE)
                .end()
                .start('p')
                    .add(this.MSG1)
                .end()
                .start('p')
                    .add(this.MSG2)
                .end()
                .start(this.NOTE)
                .end()
                .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', 
                    back: this.CANCEL, next: this.VOID_METHOD})
                .end()
                // .start()
                //     .addClass('button-container')
                //     .tag(this.CANCEL)
                //     .tag(this.VOID_METHOD)
                // .end()
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
                self.invoice.paymentMethod = self.PaymentStatus.VOID;
                self.invoice.note = self.note;
                self.invoiceDAO.put(self.invoice).then((invoice) => {
                  if (invoice.paymentMethod == self.PaymentStatus.VOID) {
                    self.notify(self.VOID_SUCCESS, 'success');
                    X.closeDialog();
                  }
                }).catch((err) => {
                  if ( err ) self.notify(self.VOID_ERROR, 'error');
                    return;
                });
            }
        }
    ]
});