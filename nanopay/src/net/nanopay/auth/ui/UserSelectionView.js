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
  package: 'net.nanopay.auth.ui',
  name: 'UserSelectionView',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    ^ .styleHolder_NameField {
      margin-right: 8px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'emptySelectionLabel',
      documentation: 'Empty selection label',
      value: 'Select...'
    },
    {
      name: 'data'
    },
    {
      name: 'fullObject'
    }
  ],

  methods: [
    function initE() {
      return this
        .start()
        .attrs({ name: "userSelectionView" })
          .addClass(this.myClass())
          .start().addClass('styleHolder_NameField')
            .add(this.data ?
              this.fullObject$.map((obj) => {
                var formatted = '';
                if ( obj ) {
                  formatted += obj.toSummary();
                  if ( obj.legalName && obj.legalName.trim() ) {
                    formatted += ` (${obj.legalName})`;
                  }
                }
                return formatted;
              }) :
              this.emptySelectionLabel)
          .end()
          .start().addClass('styleHolder_EmailField')
            .add(this.data ?
              this.fullObject$.map((obj) => obj ? obj.email : '') :
              '')
          .end()
        .end();
    }
  ]
});
