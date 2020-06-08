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
    package: 'net.nanopay.ui',
    name: 'AccountSelectionView',
    extends: 'foam.u2.View',

    documentation: `The selection view for a RichChoiceView for account to display id, name and currency.`,

    properties: [
      {
        name: 'data'
      },
      {
        name: 'fullObject'
      }
    ],

    messages: [
      {
        name: 'DEFAULT_LABEL',
        message: 'Select an Account'
      }
    ],

    methods: [
         function initE() {
           return this
             .addClass(this.myClass())
               .callIfElse(
                 this.data,
                 function() {
                   this.add(this.fullObject$.map((account) => {
                     if ( account ) {
                       return this.E()
                         .add(`${account.id}, ${account.name} ${account.denomination}`);
                     }
                   }));
                 },
                 function() {
                   this.add(this.DEFAULT_LABEL);
                 }
               );
         }
    ]
});
