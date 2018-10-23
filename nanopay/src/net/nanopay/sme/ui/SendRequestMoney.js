foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoney',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: '',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notificationDAO',
    'publicUserDAO',
    'stack',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'foam.u2.Element',
  ],

  css: `
    ^ {
      padding-top: 0px;
      height: 100% !important;
      width: 100% !important;
      margin: 0px !important;
    }
    ^ .tab {
      border-radius: 4px;
    }
    ^ .tab::selection {
      border: solid 1.5px #604aff;
    }
    ^positionColumn {
      display: inline-block;
      width: 200px;
      vertical-align: top;
      margin-left:30px;
    }
    ^ .navContainer {
      position: absolute;
      bottom: 0;
      height: 40px;
      width: 100% !important;
      background-color: white;
    }
  `,

  messages: [
    { name: 'SEND_MONEY_HEADER', message: 'Create new or choose from existing' },
    { name: 'REQUEST_MONEY_HEADER', message: '' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    },
    'isPayable',
    'type',
    'newButton',
    'existingButton',
    'isForm',
    'newButtonLabel',
    'existingButtonLabel'
  ],

  methods: [
    function init() {
      this.title = this.isPayable === true ? 'Send money' : 'Request money';
      this.type = this.isPayable === true ? 'payable' : 'receivable';

      this.views = [
        { parent: 'etransfer', id: 'send-money-details', label: 'Details', view: { class: 'net.nanopay.sme.ui.Details' } },
        { parent: 'etransfer', id: 'send-money-payment', label: 'Payment', view: { class: 'net.nanopay.sme.ui.Payment' } },
        { parent: 'etransfer', id: 'send-money-review', label: 'Review', view: { class: 'net.nanopay.sme.ui.Review' } }
      ];

      // This is required to setup labels of the viewList
      this.SUPER();
    },

    function initE() {
      this.newButtonLabel = 'New ' + this.type;
      this.existingButtonLabel = 'Existing ' + this.type;

      this.addClass(this.myClass())
        .start('div').addClass(this.myClass('positionColumn'))
          .start('p').add(this.title || '').addClass('title').end()
          .start({ class: 'net.nanopay.ui.wizard.WizardOverview', titles: this.viewTitles, position$: this.position$ }).addClass('overviewTopMargin').end()
        .end()

        .start().style({ 'display': 'inline-block' })
          .start('h2')
            .add(this.SEND_MONEY_HEADER)
          .end()
          .start(this.NEW, { label$: this.newButtonLabel$ }, this.newButton$).addClass('tab').end()
          .start(this.EXISTING, { label$: this.existingButtonLabel$ }, this.existingButton$).addClass('tab').end()

          .start()
            .start('div')
              .show(this.isForm$)
              .tag({
                class: 'net.nanopay.sme.ui.NewInvoiceModal',
                invoice: this.invoice,
                type: this.type
              })
            .end()
            .start('div')
              .hide(this.isForm$)
              // TODO: Put list here.
            .end()
          .end()
        .end()
        .start('div').addClass('navContainer')
          .start(this.GO_BACK, { label$: this.backLabel$ }).end()
          .start(this.GO_NEXT, { label$: this.nextLabel$ }).style({ 'float': 'right' }).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'new',
      label: 'New',
      code: function(X) {
        this.isForm = true;
      }
    },
    {
      name: 'existing',
      label: 'Existing',
      code: function(X) {
        this.isForm = false;
      }
    },
    {
      name: 'goBack',
      label: 'Back',
      // isAvailable: function(position, viewData, errors) {
      //   if ( position == 1 && errors && errors[0][1] == 'Rate expired' ) return false;

      //   if ( position == 3 && errors ) return false;

      //   return true;
      // },
      code: function(X) {
        if ( this.position === 0 ) {
          X.stack.back();
          return;
        }

        // if ( this.position === 1 ) { // Going back on Amount Screen
        //   this.countdownView.stop();
        //   this.countdownView.hide();
        //   this.countdownView.reset();
        //   this.viewData.fromAmount = 1.5;
        //   this.viewData.toAmount = 0;
        //   this.viewData.rateLocked = false;
        // }

        // if ( this.position === 3 ) {
        //   X.stack.push({ class: 'net.nanopay.invoice.ui.ExpensesView' });
        //   return;
        // }

        // this.subStack.back();
        this.stack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function(X) {
        self.subStack.push(self.views[self.subStack.pos + 1].view);
      }
    }
  ],
});
