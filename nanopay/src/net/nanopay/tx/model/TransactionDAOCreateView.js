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
        this.data.mode = ''; // TODO - use controllerMode instead of mode, but currently it's lost ??
        this.data.payerId = x.user ? x.user.id : 0; // to show the user who created this transaction
        x.transactionDAO.put(this.data)
        .then(
          (_) => {
            x.notify('An approval request has been created.');
            x.stack.back();
          }
        ).catch(
          (e) => {
            this.data.mode = 'create'; // if fail - want to maintain the create mode - other option is to close on fail - but this gives user option to edit with fail
            x.notify('Transaction Creation Error: ' + e.message || e, 'error');
          }
        );
      }
    }
  ],
});
