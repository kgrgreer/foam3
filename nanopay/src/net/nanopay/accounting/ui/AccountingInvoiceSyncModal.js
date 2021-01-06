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
  name: 'AccountingInvoiceSyncModal',
  extends: 'foam.u2.Controller',

  imports: [
    'user',
    'showIntegrationModal'
  ],

  requires: [
    'foam.u2.dialog.Popup'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
    'foam.mlang.Expressions'
  ],

  css: `
    ^ .Container {
      position: relative;
      width: 504px !important;
      height: 203px !important
    }
    
    ^ .headerTitle {
      margin-left: 24px;
      margin-top: 24px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 24px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      line-height: 36px;
    }
    
    ^ .content {
      width: 456px;
      height: 51px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 15px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      margin-left: 24px;
      margin-right: 24px;
      margin-top: 8px;
    }
    
    ^ .cancel-button {
      width: 96px !important;
      height: 36px !important;
      color: #525455;
      margin-top: 24px;
      box-shadow: none;
      background: rgba(0, 0, 0, 0);
      margin-left: 275px;  
      border: none;
    }

    ^ .cancel-button:hover {
      background: #fafafa !important;
      border: none;
      color: #525455;
    }
    
    ^ .continue-button {
      margin-right: 23px;
      width: 96px !important;
      height: 36px !important;
      color: white;
      background-color: #604AFF;
    }

    .foam-u2-ActionView.ignoreFloat {
      float: none !important;
    }

    ^ .continue-button:hover {
      background-color: #4D38E1 !important;
      color: white;
    }
    
    ^ .actions {
      height: 84px;
      width: 503px;
      background: #fafafa;
      position: absolute;
      bottom: 0;
    }
  `,

  properties: [
    'businessName',
    'accountingSoftwareName'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .start().addClass(this.myClass())
          .start().addClass('Container')
            .start().addClass('headerTitle').add('Sync with accounting').end()
              .start().addClass('content')
                .start().add('This invoice was imported from your ' + this.accountingSoftwareName + ' profile')
                  .add( (this.businessName == null ? '.' : ' named ' + this.businessName + '.') + ' Please sync again to ensure this information remains up to date.').end()
              .end()
              .start().addClass('actions')
                .start(this.CANCEL).addClass('cancel-button').addClass('ignoreFloat').end()
                .start(this.CONTINUE).addClass('continue-button').addClass('ignoreFloat').end()
              .end()
            .end()
          .end()
        .end();
    }
  ],
  actions: [
    {
      name: 'cancel',
      label: 'Cancel',
      code: function(X) {
        this.showIntegrationModal = false;
        X.closeDialog();
      }
    },
    {
      name: 'continue',
      label: 'Continue',
      code: function(X) {
        this.showIntegrationModal = true;
        X.closeDialog();
      }
    }
  ],
});
