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
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'SaveAndLogOutModal',
  extends: 'foam.u2.Controller',

  documentation: 'B2B Onboarding Log Out Modal',

  imports: [
    'closeDialog',
    'logOutHandler?'
  ],

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }

    ^ .content {
      padding: 20px;
      margin-top: -20px;
    }

    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 60px;
    }

    ^ .foam-u2-ActionView {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }

    ^ .foam-u2-ActionView-logOut {
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }

    ^ .foam-u2-ActionView-logOut:hover,
    ^ .foam-u2-ActionView-logOut:focus {
      background-color: rgba(164, 179, 184, 0.3);
    }

    ^ .rightContainer {
      display: inline-block;
      float:right;
    }

    ^ .foam-u2-ActionView-cancel {
      width: 73px;
      color: #59a5d5;
      margin-right: 5px;
      border: none;
      background-color: transparent;
      box-shadow: none;
    }

    ^ .foam-u2-ActionView-cancel:hover,
    ^ .foam-u2-ActionView-cancel:focus {
      border-radius: 2px;
      background-color: rgba(89, 165, 213, 0.3);
    }

    ^ .foam-u2-ActionView-saveAndLogOut {
      background-color: #59a5d5;
      color: white;
    }

    ^ .foam-u2-ActionView-saveAndLogOut:hover,
    ^ .foam-u2-ActionView-saveAndLogOut:focus {
      background-color: #357eac;
    }
  `,

  messages: [
    { name: 'Description', message: 'Are you sure you want to logout? Any unsaved data will be lost.' }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: 'Log Out' }))

        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start('div')
            .start(this.LOG_OUT).end()
            .start('div').addClass('rightContainer')
              .start(this.CANCEL).end()
              .start(this.SAVE_AND_LOG_OUT).end()
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'logOut',
      code: function(X) {
        X.logOutHandler && X.logOutHandler(0);
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'saveAndLogOut',
      code: function(X) {
        X.logOutHandler && X.logOutHandler(1);
        X.closeDialog();
      }
    }
  ]
});
