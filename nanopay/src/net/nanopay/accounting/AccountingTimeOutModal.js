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
  package: 'net.nanopay.accounting',
  name: 'AccountingTimeOutModal',
  extends: 'foam.u2.Controller',

  imports: [
    'user',
    'pushMenu'
  ],

  requires: [
    'net.nanopay.accounting.IntegrationCode'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
    'foam.mlang.Expressions'
  ],

  css: `
    ^ .Container {
      position: relative;
      width: 330px !important;
      height: 180px !important
    }

    ^ .headerTitle {
      width: 214px;
      height: 36px;
      margin-left: 24px;
      margin-top: 24px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 22px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      line-height: 36px;
    }

    ^ .content {
      margin-left:24px;
      margin-top: 8px;
      width: 282px;
      height: 51px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #525455;
    }

    ^ .cancel-button {
      width: 96px !important;
      height: 36px !important;
      color: #525455;
      box-shadow: none;
      background: rgba(0, 0, 0, 0);
      margin-top: 16px;
      margin-left: 120px;
      border: none;
    }

    ^ .cancel-button:hover {
      background: #fafafa !important;
      border: none;
      color: #525455;
    }

    ^ .sync-button {
      width: 96px !important;
      height: 36px !important;
      color: white;
      background-color: #604AFF;
    }

    .foam-u2-ActionView.ignoreFloat {
      float: none !important;
    }

    ^ .sync-button:hover {
      background-color: #4D38E1 !important;
      color: white;
    }

    ^ .actions {
      height: 68px;
      width: 328px;
      background: #fafafa;
      position: absolute;
      bottom: 0;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'goDashboard',
      value: false
    },
    {
      class: 'String',
      name: 'appName',
      factory: function() {
        return this.theme.appName;
      }
    }
  ],

  messages: [
    { name:'REMAIN_SYNC_1', message:' so your data in '},
    { name:'REMAIN_SYNC_2', message:' remains synced.'},
    { name:'TOKEN_EXIPRE', message:' token is about to expire.'},
    { name:'SYNC_AGAIN_WITH', message:'Sync again with '},
    { name:'YOUR', message:'Your '},
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .start().addClass(this.myClass())
        .start().addClass('Container')
          .start().addClass('headerTitle').add('Accounting Timeout').end()
          .start().addClass('content')
            .start().add(this.YOUR + this.user.integrationCode.label  + this.TOKEN_EXIPRE).end()
            .add(this.SYNC_AGAIN_WITH + this.user.integrationCode.label  + this.REMAIN_SYNC_1 + this.appName + this.REMAIN_SYNC_2)
          .end()
          .start().addClass('actions')
            .start(this.CANCEL_TIME_OUT_MODAL).addClass('cancel-button').addClass('ignoreFloat').end()
            .start(this.SYNC_TIME_OUT_MODAL).addClass('sync-button').addClass('ignoreFloat').end()
          .end()
        .end()
        .end()
        .end();
    }
  ],
  actions: [
    {
      name: 'cancelTimeOutModal',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
        if ( this.goDashboard ) {
          this.pushMenu('mainmenu.dashboard');
        }
      }
    },
    {
      name: 'syncTimeOutModal',
      label: 'Sync',
      code: async function() {

        let webAgent =
          this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ? 'quickbooksWebAgent' : 'xeroWebAgent';

        var url = window.location.origin + '/service/' + webAgent + '?portRedirect=' + window.location.hash.slice(1);
        var sessionId = localStorage['defaultSession'];
        if ( sessionId ) {
          url += '&sessionId=' + sessionId;
        }
        window.location = url;
      }
    }
  ],
});
