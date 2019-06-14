foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ApprovalRequestController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with approval requests.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.approval.ApprovalRequest',
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'approvalRequestDAO',
    'stack',
    'user'
  ],

  exports: [
    'data as dao'
  ],

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.approvalRequestDAO;
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function(approvalRequest) {
        this.stack.push({
          class: 'foam.comics.DAOUpdateControllerView',
          detailView: 'foam.u2.DetailView',
          key: approvalRequest.id
        }, this);
      }
    }
  ]
});
