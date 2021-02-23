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
  package: 'net.nanopay.ui.modal',
  name: 'EmailModal',
  extends: 'foam.u2.View',

  documentation: 'Email Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
      ^ {
        width: 448px;
        margin: auto;
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
    `
    })
  ],
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
          
      this
      .tag(this.ModalHeader.create({
        title: 'Email'
      }))
      .addClass(this.myClass())
      .start().style({ 'margin-top': '15px' })
        .start().addClass('label').add("Email Address").end()
        .start('input').addClass('full-width-input').end()
        .start().addClass('label').add("Note").end()
        .start('input').addClass('input-box').end()
        .start().addClass('blue-button').addClass('btn').add('Confirm').end()
      .end()
    } 
  ]
});