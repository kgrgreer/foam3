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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksDoneForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  css: `
  ^ .foam-u2-ActionView-closeButton {
    margin-left: 264px;
    box-sizing: border-box;
    background-color: #59a5d5;
    outline: none;
    border:none;
    width: 136px;
    height: 40px;
    border-radius: 2px;
    font-size: 12px;
    font-weight: lighter;
    letter-spacing: 0.2px;
    color: #FFFFFF;
  }
  `,
  messages: [
    { name: 'Step', message: 'Step 6: You\'re all set! Connection is successful.' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'See Accounts';
      if ( this.onComplete ) this.onComplete();
    },
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
          .tag(this.CLOSE_BUTTON)
        .end();
    }
  ],
  actions: [
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        this.onComplete ? this.onComplete(this.wizard) : X.form.stack.back();
      }
    },
  ]

});
