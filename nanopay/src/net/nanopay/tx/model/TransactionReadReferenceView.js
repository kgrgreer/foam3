/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.model',
  name: 'TransactionReadReferenceView',
  extends: 'foam.u2.view.ReadReferenceView',

  imports: ['transactionDAO'],

  properties: [
    {
      class: 'String',
      name: 'summary'
    }
  ],

  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      code: async function() {
        var transaction = await this.transactionDAO.find(this.data);
        if ( transaction ) {
          this.summary = await transaction.findCurrency();
        } else {
          this.summary = undefined;
        }
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.updateSummary();
     },
     function addCitationView(self) {
       this.add(self.summary$);
     }
   ]
});
