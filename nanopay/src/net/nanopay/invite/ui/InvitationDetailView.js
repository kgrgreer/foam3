foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'window'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^ .actions {
      width: 1240px;
      height: 40px;
      margin: 0 auto;
      padding: 20px 0 20px 0;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .right-actions {
      display: inline-block;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }
    ^ .net-nanopay-ui-ActionView-print {
      width: 70px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-right: 10px;
    }
    ^ .net-nanopay-ui-ActionView-print img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      margin-right: 9px;
    }
    ^ .net-nanopay-ui-ActionView-print span {
      width: 31px;
      height: 20px;
      font-family: Roboto;
      font-size: 10px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 2;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
    }
    ^ .net-nanopay-ui-ActionView-editProfile {
      width: 157px;
      height: 40px;
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
    }
    ^ .net-nanopay-ui-ActionView-editProfile::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(5px, 5px);
    }
    ^ .popUpDropDown {
      padding: 0 !important;
      z-index: 10000;
      width: 157px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .popUpDropDown > div {
      width: 157px;
      height: 30px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: %SECONDARYCOLOR%;
      color: white;
      cursor: pointer;
    }
    ^ .net-nanopay-invite-ui-InvitationHistoryView {
      width: 1240px;
      margin: 0 auto;
    }
  `,

  properties: [
    'data',
    'editProfileMenuBtn_',
    'editProfilePopUp_'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
          .end()
          .start().addClass('right-actions')
            .start(this.PRINT, { icon: 'images/ic-print.svg', showLabel: true }).end()
            .start(this.EDIT_PROFILE, null, this.editProfileMenuBtn_$).end()
          .end()
        .end()
        .tag({ class: 'net.nanopay.invite.ui.InvitationItemView', data: this.data })
        .br()
        .tag({ class: 'net.nanopay.invite.ui.InvitationHistoryView', id: this.data.id })
    }

  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function (X) {
        X.stack.back();
      }
    },
    {
      name: 'print',
      label: 'Print',
      code: function (X) {
        X.window.print();
      }
    },
    {
      name: 'editProfile',
      label: 'Edit Profile',
      code: function (X) {
        this.editProfilePopUp_ = foam.u2.PopupView.create({
          width: 157,
          x: 0,
          y: 40
        });

        this.editProfilePopUp_.addClass('popUpDropDown')
          .start('div')
            .add('Revoke Invite')
            .on('click', this.revokeInvite)
          .end()
          .start('div')
            .add('Resend Invite')
            .on('click', this.resendInvite)
          .end()
          .start('div')
            .add('Disable Profile')
            .on('click', this.disableProfile)
          .end()

        this.editProfileMenuBtn_.add(this.editProfilePopUp_);
      }
    }
  ],

  listeners: [
    function revokeInvite() {
      // TODO: add revoke invite functionality
      this.editProfilePopUp_.remove();
    },

    function resendInvite() {
      // TODO: add resend invite functionality
      this.editProfilePopUp_.remove();
    },

    function disableProfile() {
      // TODO: add disable profile functionality
      this.editProfilePopUp_.remove();
    }
  ]
});