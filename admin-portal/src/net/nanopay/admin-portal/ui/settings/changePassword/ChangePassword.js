foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.changePassword',
  name: 'ChangePassword',
  extends: 'foam.u2.Controller',

  imports: [ 'stack' ],

  documentation: 'Change password for user',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .contentCard {
          width: 960px;
          height: 204px;
          border-radius: 2px;
          background-color: #ffffff;
          margin: 0 auto;
        }
        ^ .title-container {
          margin-top: 20px;
          margin-left: 20px;
        }
        ^ .title {
          display: inline-block;
          opacity: 0.6;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-bottom: 0;
        }
        ^ .col {
          display: inline-block;
          vertical-align: top;
          width: 293px;
        }
        ^ .colSpacer{
          margin-left: 20px;
          margin-bottom: 20px;
        }
        ^ .inputFieldLabel {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
        }
        ^ input {
          width: 293px;
          height: 40px;
          padding-left: 7px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
        }
      */}
    })
  ],

  messages: [
    { name: 'Title',       message: 'Change Password' },
    { name: 'Original',     message: 'Original Password' },
    { name: 'New',          message: 'New Password' },
    { name: 'Confirm',      message: 'Confirm Password' }
  ],

  properties: [
    {
      class: 'String',
      name: 'originalPass',
    },
    {
      class: 'String',
      name: 'newPass'
    },
    {
      class: 'String',
      name: 'confirmPass'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var view = this;

      this
        .addClass(view.myClass())

        .start('div').addClass('contentCard')
          .start().addClass('title-container')
            .start('p').addClass('title').add(this.Title).end()
          .end()
          .start('div').addClass('row')
            .start('div').addClass('col').addClass('colSpacer')
              .start('p').addClass('inputFieldLabel').add(this.Original).end()
              .tag(this.ORIGINAL_PASS, { onKey: true, type: 'password' })
            .end()
            .start('div').addClass('col').addClass('colSpacer')
              .start('p').addClass('inputFieldLabel').add(this.New).end()
              .tag(this.NEW_PASS, { onKey: true, type: 'password' })
            .end()
            .start('div').addClass('col').addClass('colSpacer')
              .start('p').addClass('inputFieldLabel').add(this.Confirm).end()
              .tag(this.CONFIRM_PASS, { onKey: true, type: 'password' })
          .end()
          .start().addClass('colSpacer')
            .tag(this.UPDATE_PASSWORD, { showLabel: true })
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'updatePassword',
      label: 'Update',
      code: function() {
        console.log("Hello");
      }
    }
  ]
});
