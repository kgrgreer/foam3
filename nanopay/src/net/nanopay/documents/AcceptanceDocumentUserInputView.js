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
  package: 'net.nanopay.documents',
  name: 'AcceptanceDocumentUserInputView',
  extends: 'foam.u2.View',

  documentation: 'A view for a user to view and accept the latest version of a document.',

  requires: [
    'foam.u2.CheckBox',
    'foam.u2.LoadingSpinner'
  ],

  imports: [
    'acceptanceDocumentService'
  ],

  css: `
  ^ .checkBox {
    margin-right: .5vw;
  }
  ^ .checkBoxText {
    display: inline;
  }
  ^ label > span {
    display: none;
  }
  `,

  properties: [
    {
      class: 'String',
      name: 'docName'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'doc'
    },
    {
      class: 'Boolean',
      name: 'agreed',
      expression: function(data) {
        if ( data != 0 ) return true;
        return false;
      },
      postSet: function(o, n) {
        this.data = n ? this.doc.id : 0;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.docName$.sub(this.updateDoc);
      this.updateDoc();

      this.start()
        .addClass(this.myClass())
        .startContext({ data: this })
          .start()
            .hide(this.doc$.map((d) => ! d))
            .start(this.AGREED).addClass('checkBox')
              .start().addClass('checkBoxText')
              .on('click', () => {
                self.agreed = ! self.agreed;
              })
                .add(this.doc$.dot('checkboxText'))
              .end()
              .start('a')
                .addClass('link')
                .add(this.doc$.dot('title'))
                .attrs({
                  href: this.doc$.dot('link'),
                  target: '_blank'
                })
              .end()
            .end()
          .end()
          .add(this.doc$.map( (d) => ! d ? this.LoadingSpinner.create() : null ))
        .endContext()
      .end();
    }
  ],

  listeners: [
    {
      name: 'updateDoc',
      isFramed: true,
      code: function() {
        this.doc = null;
        this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, this.docName, '')
          .then((doc) => {
            this.doc = doc;
          })
          .catch((e) => {
            console.warn('Error occurred finding Terms Agreement: ', e);
          });
      }
    }
  ]
});
