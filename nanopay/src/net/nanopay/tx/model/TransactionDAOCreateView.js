/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  documentation: `
    A configurable view to create a Transaction instance
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          of: 'net.nanopay.tx.model.Transaction'
        };
      }
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(data$errors_) {
        return ! data$errors_;
      },
      code: function(x) {
        this.data.referenceNumber = 'ManuallyCreated';
        x.liquidTransactionDAO.put(this.data)
        .then(
          (_) => {
            x.notify('Transaction Created Successfully!');
            x.stack.back();
          }
        ).catch(
          (e) => {
            x.notify('Transaction Creation Error: ' + e.message || e, 'error');
          }
        );
      }
    }
  ],
});
