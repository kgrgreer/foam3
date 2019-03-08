foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'AccountingTimeOutModal',
  extends: 'foam.u2.Controller',

  imports: [
    'user'
  ],

  requires: [
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
      font-family: Lato;
      font-size: 24px;
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
      font-family: Lato;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #525455;
    }
    
    ^ .net-nanopay-ui-ActionView-cancel {
      width: 96px;
      height: 36px;
      color: #525455;
      box-shadow: none;
      background: rgba(0, 0, 0, 0);
      margin-top: 16px;
      margin-left: 120px;  
    }

    ^ .net-nanopay-ui-ActionView-cancel:hover {
      background: rgba(0, 0, 0, 0);
    }
    
    ^ .net-nanopay-ui-ActionView-sync {
      width: 96px;
      height: 36px;
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
  ],

  methods: [
    function initE() {
      this.timer = setInterval(() => {
        this.countDownValue--;
      }, 1000);

      this.SUPER();
      this
        .start().addClass(this.myClass())
        .start().addClass('Container')
          .start().addClass('headerTitle').add('Accounting Timeout').end()
          .start().addClass('content')
            .start().add('Your ' + this.user.integrationCode.label  + ' token is about to expire.').end()
            .add(' Sync again with ' + this.user.integrationCode.label  + ' so your data in Ablii remains synced.')
          .end()
          .start().addClass('actions')
            .add(this.CANCEL).addClass('cancel')
            .add(this.SYNC).addClass('sync')
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
       
        X.closeDialog();
      }
    },
    {
      name: 'sync',
      label: 'Sync',
      code: async function(X) {

        X.closeDialog();
      }
    }
  ],
});
