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

  requires: [
    'foam.log.LogLevel'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
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
        this.data.mode = ''; // TODO - use controllerMode instead of mode, but currently it's lost ??
        this.data.payerId = x.user ? x.user.id : 0; // to show the user who created this transaction
        x.transactionDAO.put(this.data)
        .then(
          (_) => {
            x.notify('An approval request has been created.', '', this.LogLevel.INFO, true);
            x.stack.back();
          }
        ).catch(
          (e) => {
            this.data.mode = 'create'; // if fail - want to maintain the create mode - other option is to close on fail - but this gives user option to edit with fail
            x.notify('Transaction Creation Error: ' + e.message || e, '', this.LogLevel.ERROR, true);
          }
        );
      }
    }
  ],
});
