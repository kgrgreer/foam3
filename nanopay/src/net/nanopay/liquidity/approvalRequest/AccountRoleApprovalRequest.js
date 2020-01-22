foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountRoleApprovalRequest',
  extends: 'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',

  tableColumns: [
    'classification',
    'operation',
    'outgoingAccount',
    'initiatingUser',
    'approver',
    'status'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'outgoingAccount',
      section: 'requestDetails',
      tableCellFormatter: function(outgoingAccount) {
        let self = this;
        this.__subSubContext__.accountDAO.find(outgoingAccount).then((account)=> {
          self.add(account.toSummary())
        });
      }
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        return `(${this.classification}:${this.outgoingAccount}) ${this.operation}`;
      }
    }
  ]
});
