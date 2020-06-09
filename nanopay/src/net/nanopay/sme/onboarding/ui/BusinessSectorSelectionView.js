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
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessSectorSelectionView',
  extends: 'foam.u2.Element',

  documentation: `The selection view for a RichChoiceView of BusinessSectors.`,

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
      font-size: 12px;
      color: #424242;
    }
  `,

  messages: [
    { name: 'DEFAULT_LABEL', message: 'Select industry...' }
  ],

  properties: [
    'data',
    'fullObject'
  ],

  methods: [
    function initE() {
      return this
        .addClass(this.myClass())
        .start()
          .add(this.data
            ? this.fullObject$.map((obj) => obj ? obj.name : '')
            : this.DEFAULT_LABEL
          )
        .end();
    }
  ]
});
