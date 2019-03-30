foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingReportModal',
  extends: 'foam.u2.Controller',

  imports: [
    'user',
    'pushMenu'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
    'foam.mlang.Expressions'
  ],

  css: `
  ^ .Container {
    width: 900px !important;
    height: 600px !important;
  }
  ^ .headerTitle {
    margin: auto;
    width: 214px;
    height: 36px;
    margin-left: 24px;
    margin-top: 24px;
    font-family: Lato;
    font-size: 24px;
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    line-height: 36px;
  }
  ^ .center {
    margin: auto;
    text-align: center;
  }
  ^ .content {
    height: 500px;
    margin-left: 24px;
    margin-top: 8px;
    margin-right: 24px;
    margin-bottom: 8px;
    font-family: Lato;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #525455;
    overflow: auto
  }
  ^ .actions {
    background: #fafafa;
    text-align: center;
  }
  ^ .success {
    border-color: #03cf1f;
    background-color: #f6fff2;
  }
  ^ .error {
    border-color: #f91c1c;
    background-color: #fff6f6;
  }
  ^ .warning {
    border-color: #604aff;
    background-color: #f5f4ff;
  }
  ^ .result-item {
    margin-top: 1px;
    border-style: solid;
    padding: 2px;
  }

  `,

  properties: [
    'invoiceResult',
    'contactResult',
    {
      name: 'redirect',
      type: 'Boolean',
      value: 'true'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .start().addClass(this.myClass())
        .start().addClass('Container')
          .start().addClass('headerTitle').addClass('center').add('Sync Report').end()
          .start().addClass('content')
            .call(function() {
              if ( self.contactResult.contactSyncErrors.length  > 0 ) {
                this.start('h2').add('Contact Sync Errors').addClass('center').end();
                for ( i = 0; i < self.contactResult.contactSyncErrors.length; i++ ) {
                  this
                    .start()
                      .add(self.contactResult.contactSyncErrors[i]).addClass('result-item').addClass('error')
                    .end();
                }
              }
              if ( self.invoiceResult.invoiceSyncErrors.length > 0 ) {
                this.start('h2').add('Invoice Sync Errors').addClass('center').end();
                for ( i = 0; i < self.invoiceResult.invoiceSyncErrors.length; i++ ) {
                  this
                    .start()
                      .add(self.invoiceResult.invoiceSyncErrors[i]).addClass('result-item').addClass('error')
                    .end();
                }
              }
            })
            .call(function() {
              if ( self.contactResult.contactSyncMismatches.length  > 0 ) {
                this.start('h2').add('Unsynced Contacts').addClass('center').end();
              
                for ( i = 0; i < self.contactResult.contactSyncMismatches.length; i++ ) {
                  if ( self.contactResult.contactSyncMismatches[i].resultCode.name === 'EXISTING_CONTACT' ) {
                    this
                      .start().addClass('result-item').addClass('warning')
                        .add('A contact with that email address already exists')
                        .add('Ablii contact : ' + self.contactResult.contactSyncMismatches[i].existContact.email)
                        .add('Accounting software contact: ' + self.contactResult.contactSyncMismatches[i].newContact.email)
                      .end();
                  } else if ( self.contactResult.contactSyncMismatches[i].resultCode.name === 'EXISTING_USER' ) {
                    this
                      .start().add('A user already exists on Ablii with the email : ' + self.contactResult.contactSyncMismatches[i].existContact.email).addClass('result-item').addClass('warning').end();
                  } else if ( self.contactResult.contactSyncMismatches[i].resultCode.name === 'EXISTING_USER_MULTI' ) {
                    this
                      .start().add('A user on Ablii with the email address : ' + self.contactResult.contactSyncMismatches[i].existContact.email + ' belongs to multiple businessness on Ablii').addClass('result-item').addClass('warning').end();
                  } else if ( self.contactResult.contactSyncMismatches[i].resultCode.name === 'EXISTING_USER_CONTACT' ) {
                    this
                    .start().add('A contact who is also an user already exists on Ablii with the email : ' + self.contactResult.contactSyncMismatches[i].existContact.email).addClass('result-item').addClass('warning').end();
                  }
                }
              }
            })
          .end()
          .start().addClass('actions')
            .add(this.CANCEL).addClass('cancel')
          .end()
        .end()
        .end()
        .end();
    }
  ],
  actions: [
    {
      name: 'cancel',
      label: 'Continue',
      code: function(X) {
        X.closeDialog();
        if (this.redirect) {
          this.pushMenu('sme.main.dashboard')
        }
      }
    },
  ],
});
