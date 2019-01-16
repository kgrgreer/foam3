foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'ConfirmDisable2FAModal',
  extends: 'foam.u2.Controller',

  documentation: 'A Popup modal to confirm user disabling 2FA',

  imports: [
    'agent',
    'closeDialog',
    'ctrl',
    'notify',
    'twofactor'
  ],

  css: `
    ^ {
      width: 504px;
    }

    ^top-container {
      padding: 24px;
    }

    ^title {
      font-size: 24px;
      font-weight: 800;

      color: #2b2b2b;
      margin: 0;
    }

    ^instructions {
      font-size: 14px;
      color: #525455;
      margin: 0;
      margin-top: 24px;
      margin-bottom: 16px;
    }

    ^instructions: last-child {
      margin-bottom: 0;
    }

    ^field-label {
      margin: 0;
      margin-top: 24px;
      margin-bottom: 8px;

      font-weight: 800;
      font-size: 12px;
    }

    ^field {
      width: 100%;
      height: 40px;
      padding: 10px 8px;
    }

    ^bottom-container {
      display: flex;
      width: 100%;
      padding: 24px;
      background-color: #fafafa;
      box-sizing: border-box;
    }

    ^action-container {
      margin-left: auto;
    }

    ^cancel {
      background-color: transparent;
      color: #525455;
      border: none;
      box-shadow: none;
      width: auto;
      height: auto;
      margin-right: 24px;
      font-size: 14px;
      font-weight: light;
    }

    ^cancel:hover {
      background-color: transparent !important;
      color: #525455;
      border: none;
      box-shadow: none;
    }

    ^disable {
      background-color: #f91c1c;
      color: white;
      border: none;
      width: auto;
      padding: 4px 24px;
    }

    ^disable:hover {
      background-color: #da1818 !important;
      color: white;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Disable two-factor authentication?' },
    { name: 'INSTRUCTIONS_1', message: 'Two-factor authentication provides an added layer of security to your account by decreasing the probability that an attacker can impersonate you or gain access to your sensitve account information.' },
    { name: 'INSTRUCTIONS_2', message: 'We strongly recommend keeping it enabled.' },
    { name: 'FIELD_LABEL', message: 'Enter validation code' },
    { name: 'FIELD_PLACEHOLDER', message: 'Enter code' },
    { name: 'ERROR_NO_TOKEN', message: 'Please enter a verification token.' },
    { name: 'ERROR_DISABLE', message: 'Could not disable two-factor authentication. Please try again.' },
    { name: 'SUCCESS', message: 'Two-factor authentication disabled.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'validationCode'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass('top-container'))
          .start('p').addClass(this.myClass('title'))
            .add(this.TITLE)
          .end()
          .start('p').addClass(this.myClass('instructions'))
            .add(this.INSTRUCTIONS_1)
          .end()
          .start('p').addClass(this.myClass('instructions'))
            .add(this.INSTRUCTIONS_2)
          .end()
          .start('p').addClass(this.myClass('field-label'))
            .add(this.FIELD_LABEL)
          .end()
          .start(this.VALIDATION_CODE).addClass(this.myClass('field'))
            .attrs({ 'placeholder': this.FIELD_PLACEHOLDER })
          .end()
        .end()
        .start().addClass(this.myClass('bottom-container'))
          .start().addClass(this.myClass('action-container'))
            .start(this.CANCEL).addClass(this.myClass('cancel')).end()
            .start(this.DISABLE).addClass(this.myClass('disable')).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'disable',
      code: function() {
        var self = this;

        if ( ! this.validationCode ) {
          this.ctrl.notify(this.ERROR_NO_TOKEN, 'error');
          return;
        }

        this.twofactor.disable(null, this.validationCode)
          .then(function(result) {
            if ( ! result ) {
              self.ctrl.notify(self.ERROR_DISABLE, 'error');
              return;
            }

            self.validationCode = '';
            self.agent.twoFactorEnabled = false;
            self.ctrl.notify(self.SUCCESS);
            self.closeDialog();
          })
          .catch(function(err) {
            self.ctrl.notify(self.ERROR_DISABLE, 'error');
          });
      }
    },
    {
      name: 'cancel',
      code: function() {
        this.closeDialog();
      }
    }
  ]
});
