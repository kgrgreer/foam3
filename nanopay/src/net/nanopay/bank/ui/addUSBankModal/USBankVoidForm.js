foam.CLASS({
  package: 'net.nanopay.bank.ui.addUSBankModal',
  name: 'USBankVoidForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  imports: [
    'accountDAO',
    'bank',
    'blobService',
    'ctrl',
    'menuDAO',
    'notify',
    'stack',
    'user',
    'validateAccountNumber',
    'validateInstitutionNumber',
    'validateRoutingNumber',
    'validateTransitNumber'
  ],

  exports: [
    'as void'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.FormValidation'
  ],

  requires: [
    'foam.blob.BlobBlob',
    'foam.mlang.MLang',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileArray',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account'
  ],

  css: `
    ^ {
      width: 504px;
      box-sizing: border-box;

      max-height: 80vh;
      overflow-y: scroll;
    }
    ^ .form-container {
      padding: 24px;
      padding-top: 0;
    }
    ^ .fieldTitle {
      font-size: 12px;
      line-height: 12px;
      font-weight: 600;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
      margin-bottom: 8px;
      padding: 0 !important;
    }
    ^ .largeInput {
      width: 100%;
      border-radius: 3px;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      border: solid 1px #8e9090;
      background-color: #ffffff;
    }
    ^img {
      width: 100%;
      margin-top: 24px;
      margin-bottom: 4px;
    }
    ^title {
      margin: 0;
      padding: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;

      margin: 0;
    }
    ^field-container {
      display: inline-block;
      vertical-align: top;
      width: 220px;
    }
    ^field-container.routing {
      margin-right: 16px;
    }
    ^field-container-account {
      flex-grow: 2;
    }
    ^field-container input {
      width: 100%;
      height: 40px;
    }
    ^name-container {
      margin-top: 16px;
      width: 100%;
    }
    ^hint {
      margin: 0;
      margin-top: 8px;
      font-size: 10px;
    }
    ^ .net-nanopay-ui-DataSecurityBanner {
      margin-top: 24px;
    }
    ^ .divider {
      width: 100%;
      height: 1px;
      margin: 24px 0;
      background-color: #e2e2e3;
    }
    ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
      margin-top: 24px;
      width: 100%;
    }
    ^flex{
      display: flex;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'SUB_TITLE', message: 'Connect to your account without signing in to online banking.' },
    { name: 'SUB_TITLE1', message: 'Please ensure your details are entered correctly.' },
    { name: 'SUB_TITLE2', message: 'Please upload either an image of a void check or a bank statement from within the past 3 months to verify ownership of this bank account.' },
    { name: 'ROUT', message: 'ACH Routing No.' },
    { name: 'ACC', message: 'ACH Account No.' },
    { name: 'LABEL_NICKNAME', message: 'Nickname' },
    { name: 'HINT', message: 'Set a nickname to easily identify your account later on.' },
    { name: 'DROP_ZONE_TITLE', message: 'DRAG & DROP YOUR VOID CHECK HERE' },
    { name: 'ERROR_INVALID_ROUTING', message: 'Invalid ACH Routing No.' },
    { name: 'ERROR_INVALID_ACCOUNT', message: 'Invalid ACH Account No.' },
    { name: 'ERROR_INVALID_NICKNAME', message: 'Invalid nickname' },
    { name: 'ERROR_MISSING_SAMPLE', message: 'Please attach a void check.' },
    { name: 'BANK_NAME_PLACEHOLDER', message: 'My Bank' }
  ],

  properties: [
    {
      name: 'routingNum',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        placeholder: ' 123456789',
        onKey: true,
        maxLength: 9
      },
      factory: function() {
        return this.bank.branchId;
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var regEx = /^\d+$/;
        return regEx.test(n) ? n : o;
      },
      postSet: function(_, n) {
        this.bank.branchId = n;
      }
    },
    {
      name: 'accountNum',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        placeholder: ' 1234567',
        onKey: true
      },
      factory: function() {
        return this.bank.accountNumber;
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var regEx = /^\d+$/;
        return regEx.test(n) ? n : o;
      },
      postSet: function(_, n) {
        this.bank.accountNumber = n;
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'voidCheckFile',
      factory: function() {
        return this.bank.voidCheckImage ? [this.bank.voidCheckImage] : [];
      },
      postSet: function(_, n) {
        if ( n.length > 0 ) {
          this.bank.voidCheckImage = n[0];
        }
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .on('dragover', self.onDragOver)
        .on('drop', self.onDropOut)
        .start('p').addClass(this.myClass('title')).add(this.TITLE).end()
        .start().addClass('form-container')
          .start('p').addClass(this.myClass('instructions')).add(this.SUB_TITLE).end()
          .start('p').addClass(this.myClass('instructions')).add(this.SUB_TITLE1).end()
          .start({ class: 'foam.u2.tag.Image', data: 'images/USA-Check@2x.png' }).addClass(this.myClass('img')).end()
          .start()
            .addClass(this.myClass('flex'))
            .start().addClass(this.myClass('field-container')).addClass('routing')
              .start('p').add(this.ROUT).addClass('fieldTitle').end()
              .start(this.ROUTING_NUM).addClass('largeInput').end()
            .end()
            .start().addClass(this.myClass('field-container-account'))
              .start('p').add(this.ACC).addClass('fieldTitle').end()
              .start(this.ACCOUNT_NUM).addClass('largeInput').end()
            .end()
          .end()
          .start().addClass(this.myClass('field-container')).addClass(this.myClass('name-container'))
            .start('p').addClass('fieldTitle').add(this.LABEL_NICKNAME).end()
            .startContext({ data: this.bank })
              .tag(this.bank.NAME, { placeholder: this.BANK_NAME_PLACEHOLDER })
            .endContext()
            .start('p').addClass(this.myClass('hint')).add(this.HINT).end()
          .end()
          .start().addClass('divider').end()
          .start('p').addClass(this.myClass('instructions')).add(this.SUB_TITLE2).end()
          .start({
            class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
            files$: this.voidCheckFile$,
            title: this.DROP_ZONE_TITLE,
            supportedFormats: {
              'image/jpg': 'JPG',
              'image/jpeg': 'JPEG',
              'image/png': 'PNG',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
              'application/msword': 'DOC',
              'application/pdf': 'PDF'
            },
            isMultipleFiles: false
          }).end()
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
        .end()
        .start({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK, next: this.NEXT
        })
        .end();
    },

    function validateInputs() {
      if ( ! this.validateRoutingNumber(this.routingNum) ) {
        ctrl.notify(this.ERROR_INVALID_ROUTING, 'error');
        return false;
      }

      if ( ! this.validateAccountNumber(this.accountNum) ) {
        ctrl.notify(this.ERROR_INVALID_ACCOUNT, 'error');
        return false;
      }

      if ( this.bank.name === '' ) {
        ctrl.notify(this.ERROR_INVALID_NICKNAME, 'error');
        return false;
      }

      if ( this.bank.errors_ ) {
        ctrl.notify(this.bank.errors_[0][1], 'error');
        return false;
      }

      if ( this.voidCheckFile.length === 0 ) {
        ctrl.notify(this.ERROR_MISSING_SAMPLE, 'error');
        return false;
      }

      return true;
    }
  ],

  actions: [
    {
      name: 'next',
      label: 'Next',
      code: function(X) {
        var model = X.void;
        if ( ! model.validateInputs() ) return;
        X.pushToId('pad');
      }
    },
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ],

  listeners: [
    function onDragOver(e) {
      e.preventDefault();
    },

    function onDropOut(e) {
      e.preventDefault();
    }
  ]
});
