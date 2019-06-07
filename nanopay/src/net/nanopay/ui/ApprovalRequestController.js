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
    'dao',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function(approvalRequest) {
        // FIXME: Is there a better way to get an arbitrary DAO out of the
        // context by name?
        this.dao = this.__subContext__[approvalRequest.daoKey];
        this.stack.push({
          class: 'foam.comics.DAOUpdateControllerView',
          detailView: 'foam.u2.DetailView',
          key: approvalRequest.objId
        }, this);
      }
    }
  ]
});
