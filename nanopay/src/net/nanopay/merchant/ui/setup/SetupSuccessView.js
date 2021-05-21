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
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupSuccessView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Success screen after set up',

  imports: [
    'stack'
  ],

  css: `
    ^ {
      width: 100%;
      height: 100%;
      background: #35c38d;
      margin-top: -56px;
    }
    ^ .success-view-div {
      padding-top: 70px;
      padding-left: 36px;
    }
    ^ .success-icon img {
      height: 76px;
      width: 76px;
    }
    ^ .success-message {
      font-size: 32px;
      font-weight: 300;
      text-align: left;
      padding-top: 30px;
    }
    ^ .success-button-wrapper {
      padding-top: 50px;
    }
    ^ .success-next-button {
      height: 20px;
      font-size: 16px;
      line-height: 1.25;
      text-align: center;
    }
  `,

  properties: [
    ['header', false]
  ],

  messages: [
    { name: 'provisionSuccess', message: 'Your device has been successfully provisioned!' },
    { name: 'provisionButton', message: 'Start accepting payments! >>' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('success-view-div')
          .start('div')
            .addClass('success-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-success.svg' })
          .end()
          .start()
            .addClass('success-message')
            .add(this.provisionSuccess)
          .end()
          .start('div').addClass('success-button-wrapper')
            .start('button').addClass('success-next-button')
              .add(this.provisionButton)
              .on('click', this.onNextClicked)
            .end()
          .end()
        .end();
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( key === 'Enter' || key === 13 ) {
        this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
      }
    },

    function onNextClicked (e) {
      this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
    }
  ]
})
