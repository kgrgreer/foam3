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
  package: 'net.nanopay.admin.ui.form.shared',
  name: 'AddUserDoneForm',
  extends: 'foam.u2.Controller',

  documentation: 'Screen to let user know they have finished adding a user',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css: `
    ^ .description {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 20px;
    }
    ^ .referenceNumber {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: #2cab70;
      margin-top: 10px;
    }
  `,

messages: [
  { name: 'Step', message: 'Step 4: Done!' },
  { name: 'Description', message: 'An e-mail with the login information has been sent to this user.' },
  { name: 'ReferenceNumber', message: 'Reference No.' }
],

methods: [
  function initE() {
    this.SUPER();

    this
      .addClass(this.myClass())
      .start()
        .start('p').add(this.Step).addClass('pDefault').addClass('stepTopMargin').end()
        .start('p').add(this.Description).addClass('description').end()
      .end();
  }
]

}); 