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
    package: 'net.nanopay.tx.ui',
    name: 'PayeeSelectionView',
    extends: 'foam.u2.View',
  
    properties: [
      {
        name: 'data',
        documentation: 'The selected object.'
      },
      'fullObject',
      'viewData'
    ],
  
    methods: [
      function initE() {
        let display = 'Select a payee';   
  
        if ( this.fullObject !== undefined ) {
          display = this.fullObject.email;
        } else if ( this.viewData.payeeAccountCheck && this.viewData.payeeCard ) {
          display  = this.viewData.payeeCard.email;
        }
  
        return this
          .start()
            .add(display)
          .end();
      }
    ]
  });
  