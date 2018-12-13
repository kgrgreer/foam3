foam.CLASS({
  package: 'net.nanopay.bank.ui.CAUSBankModal',
  name: 'CAUSBankModal',
  extends: 'foam.u2.View',

  imports: [
    'accountDAO',
    'blobService',
    'ctrl',
    'menuDAO',
    'stack',
    'user',
    'validateAccountNumber',
    'validateInstitutionNumber',
    'validateRoutingNumber',
    'validateTransitNumber'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.FormValidation'
  ],

  requires: [
    'foam.blob.BlobBlob',
    'foam.core.Action',
    'foam.mlang.MLang',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileArray',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.bank.CABankAccount',
    'foam.nanos.auth.Address'
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
    }
    ^ .fieldTitle {
      font-size: 12px;
      line-height: 12px;
      font-weight: 600;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
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
    ^ .img {
      width: 456px;
      margin-top: 24px;
      margin-bottom: 4px;
    }
    ^ .sub-tit {
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
    }
    ^ .tit {
      margin: 0;
      margin-bottom: 24px;
      font-size: 24px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #2b2b2b;
    }
    ^ .net-nanopay-ui-ActionView {
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      border: solid 1px #4a33f4;
      background-color: #604aff;
      margin-bottom: 30px;
      margin-top: 45px;
      float: right;
      margin-right: 10px;
    }

    ^ .field-container {
      display: inline-block;
      vertical-align: middle;
      width: 218px;
    }

    ^ .field-container.transit {
      width: 133px;
      margin-right: 16px;
    }

    ^ .field-container.institution {
      width: 71px;
    }

    ^ .field-container.account {
      width: 220px;
    }

    ^ .field-container:last-child {
      float: right;
    }

    ^ .form-button-container {
      width: 100%;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px;

      box-sizing: border-box;
    }

    ^ .form-button-table {
      display: table;
      float: right;
      height: 100%;
    }

    ^ .net-nanopay-ui-ActionView {
      width: 96px;
      margin: 0;
      padding: 0;
    }

    ^ .form-button {
      width: 96px;
      height: 36px;
      display: table-cell;
      vertical-align: middle;
    }

    ^ .net-nanopay-ui-ActionView-cancelB {
      background-color: transparent;
      color: #525455;
      border: none;
      box-shadow: none;
    }

    ^ .net-nanopay-ui-ActionView-cancelB:hover {
      background-color: transparent;
      border: none;
      color: #525455;
    }

    ^ .medium-header {
      font-weight: 300;
    }

    ^ .half-container {
      width: 46%;
    }

    ^ .medium-header {
      margin-bottom: 10px;
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
  `,

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'SUB_TITLE', message: 'Connect to your account without signing in to online banking.' },
    { name: 'SUB_TITLE1', message: 'Please ensure your details are entered correctly.' },
    { name: 'SUB_TITLE2', message: 'Please upload either an image of a void check or a bank statement from within the past 3 months to verify ownership of this bank account.' },
    { name: 'TRAN', message: 'Transit #' },
    { name: 'INST', message: 'Institution #' },
    { name: 'ROUT', message: 'Routing #' },
    { name: 'ACC', message: 'Account #' },
    { name: 'DROP_ZONE_TITLE', message: 'DRAG & DROP YOUR VOID CHECK HERE' },
    { name: 'ERROR_INVALID_TRANSIT', message: 'Invalid transit #' },
    { name: 'ERROR_INVALID_ROUTING', message: 'Invalid routing #' },
    { name: 'ERROR_INVALID_INSTITUTION', message: 'Invalid institution #' },
    { name: 'ERROR_INVALID_ACCOUNT', message: 'Invalid account #' },
    { name: 'ERROR_MISSING_SAMPLE', message: 'Please attach a void check.' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isCanadianForm',
      value: false
    },
    {
      class: 'String',
      name: 'voidCheckPath'
    },
    {
      class: 'String',
      name: 'transitNumber',
      view: {
        class: 'foam.u2.TextField',
        placeholder: '12345'
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      view: {
        class: 'foam.u2.TextField',
        placeholder: '123'
      }
    },
    {
      name: 'routingNum',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        placeholder: ' 123456789',
        maxLength: 9
      }
    },
    {
      name: 'accountNum',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        placeholder: ' 1234567'
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: `Bank account address.`,
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'voidCheckFile',
      factory: function() {
        return [];
      }
    },
    'onDismiss'
  ],

  methods: [
    function init() {
      var self = this;
      this.voidCheckPath = this.isCanadianForm ? 'images/Canada-Check@2x.png' : 'images/USA-Check@2x.png';
      this.onDetach(function(){
        if ( self.onDismiss ) self.onDismiss();
      });
    },
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .on('dragover', self.onDragOver)
        .on('drop', self.onDropOut)
        .start().addClass('form-container')
          .start('h2').add(this.TITLE).addClass('tit').end()
          .start().addClass('sub-tit')
            .start().add(this.SUB_TITLE).end()
            .start().add(this.SUB_TITLE1).end()
          .end()
          .start({ class: 'foam.u2.tag.Image', data: this.voidCheckPath }).addClass('img').end()
          .start()
            .callIf(this.isCanadianForm, function() {
              this.start().addClass('field-container').addClass('transit')
                .start('p').add(self.TRAN).addClass('fieldTitle').end()
                .start(self.TRANSIT_NUMBER).addClass('largeInput').end()
              .end()
              .start().addClass('field-container').addClass('institution')
                .start('p').add(self.INST).addClass('fieldTitle').end()
                .start(self.INSTITUTION_NUMBER).addClass('largeInput').end()
              .end()
              .start().addClass('field-container').addClass('account')
                .start('p').add(self.ACC).addClass('fieldTitle').end()
                .start(self.ACCOUNT_NUM).addClass('largeInput').end()
              .end()
            })
            .callIf(!this.isCanadianForm, function() {
              this.start().addClass('field-container')
                .start('p').add(self.ROUT).addClass('fieldTitle').end()
                .start(self.ROUTING_NUM).addClass('largeInput').end()
              .end()
              .start().addClass('field-container')
                .start('p').add(self.ACC).addClass('fieldTitle').end()
                .start(self.ACCOUNT_NUM).addClass('largeInput').end()
              .end()
            })
          .end()
          .callIf(!this.isCanadianForm, function() {
            this.start().addClass('divider').end()
            .start().addClass('sub-tit')
              .start().add(self.SUB_TITLE2).end()
            .end()
            this.start({
              class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
              files$: self.voidCheckFile$,
              title: self.DROP_ZONE_TITLE,
              supportedFormats: {
                'image/jpg': 'JPG',
                'image/jpeg': 'JPEG',
                'image/png': 'PNG',
                'application/msword': 'DOCX',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOC',
                'application/pdf': 'PDF'
              },
              isMultipleFiles: false
            })
          })
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
        .end()
        .start().addClass('form-button-container')
          .start().addClass('form-button-table')
            .start().add(this.CANCEL_B).addClass('form-button').end()
            .start().add(this.CONNECT).addClass('form-button').end()
          .end()
        .end();
    },

    function validateInputs() {
      if ( this.isCanadianForm ) {
        if ( ! this.validateTransitNumber(this.transitNumber) ) {
          this.notify(this.ERROR_INVALID_TRANSIT, 'error');
          return false;
        }
        if ( ! this.validateInstitutionNumber(this.institutionNumber) ) {
          this.notify(this.ERROR_INVALID_INSTITUTION, 'error');
          return false;
        }
      } else {
        if ( ! this.validateRoutingNumber(this.routingNum) ) {
          this.notify(this.ERROR_INVALID_ROUTING, 'error');
          return false;
        }
      }

      if ( ! this.validateAccountNumber(this.accountNum) ) {
        this.notify(this.ERROR_INVALID_ACCOUNT, 'error');
        return false;
      }
      if ( ! this.isCanadianForm && this.voidCheckFile.length === 0 ) {
        this.notify(this.ERROR_MISSING_SAMPLE, 'error');
        return false;
      }
      return true;
    },

    function notify(message, type) {
      this.add(this.NotificationMessage.create({
        message,
        type
      }));
    }
  ],

  actions: [
    {
      name: 'connect',
      label: 'Connect',
      code: async function(X) {
          var accSize = 0;
          var denom = this.isCanadianForm ? 'CAD' : 'USD';

          await this.accountDAO.where(this.EQ(this.Account.DENOMINATION, denom))
            .select(this.COUNT()).then( (count) => {
              accSize = count.value;
            });

          if ( ! this.validateInputs() ) return;

          var newAccount;
          if ( ! this.isCanadianForm ) {
            newAccount = this.USBankAccount.create({
              name: `USBank ${accSize}`,
              branchId: this.routingNum,
              accountNumber: this.accountNum,
              status: this.BankAccountStatus.VERIFIED,
              owner: this.user.id,
              denomination: denom,
              bankAddress: this.address,
              voidCheckImage: this.voidCheckFile[0]
            }, X);
          } else {
            newAccount = this.CABankAccount.create({
              name: `CADBank ${accSize}`,
              institutionNumber: this.institutionNumber,
              branchId: this.transitNumber,
              accountNumber: this.accountNum,
              status: this.BankAccountStatus.VERIFIED,
              owner: this.user.id,
              bankAddress: this.address,
              denomination: denom
            });
          }

          if ( newAccount.errors_ ) {
            this.ctrl.add(this.NotificationMessage.create({ message: newAccount.errors_[0][1], type: 'error' }));
            return;
          }
          this.accountDAO.put(newAccount).then( (acct) => {
            if ( ! acct ) {
              this.ctrl.add(this.NotificationMessage.create({ message: 'Oops, something went wrong. Please try again', type: 'error' }));
            } else {
              this.ctrl.add(this.NotificationMessage.create({ message: 'Your bank account was successfully added'}));
              X.closeDialog();
              this.stack.back();
            }
          }, error => {
            this.ctrl.add(this.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
      }
    },
    {
      name: 'cancelB',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
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
