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
  name: 'UploadAdditionalDocumentsView',
  extends: 'foam.u2.View',

  documentation: 'Upload Additional Documents View',

  requires: [
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'user'
  ],

  messages: [
    { name: 'Title',       message: '1. Upload Additional Documents' },
    { name: 'Description', message: 'Upload any additional documents upon request.' }
  ],

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.viewData.user.additionalDocuments$,
        };
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('p').addClass('containerTitle').add(this.Title).end()
        .start().addClass('containerDesc').add(this.Description).end()
        .br()
        .start(this.ADDITIONAL_DOCUMENTS).end()
    }
  ]
});