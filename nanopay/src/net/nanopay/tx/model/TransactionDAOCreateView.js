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
          class: 'net.nanopay.ui.TransferView'
        };
      }
    }
  ],

  actions: [
    {
      name: 'save',
      isAvailable: function() {
        return false;
      },
    },
  ],
});
