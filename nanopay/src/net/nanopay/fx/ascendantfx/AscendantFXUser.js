
foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXUser',

  documentation: 'Mapping for nanoPay User to AscendantFX Payee',

  import: [
    'net.nanopay.fx.ascendantfx.AscendantFXHoldingAccount',
    'net.nanopay.fx.FXUserStatus'
  ],

  searchColumns: [],

  tableColumns: [
    'id',
    'user',
    'name',
    'orgId',
    'userStatus'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      label: 'User ID',
      required: true,
      view: function(_, X) {
       return foam.u2.view.ChoiceView.create({
         dao: X.businesDAO,
         objToChoice: function(a) {
           return [a.id, a.firstName + ' ' + a.lastName];
         }
       });
     }
    },
    {
      class: 'String',
      name: 'orgId',
      documentation: 'AscendantFX Organization ID'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.fx.FXUserStatus',
      name: 'userStatus',
      label: 'Status',
      documentation: `
      Keeps track of the different states a FX user can be in with respect to
      whether the user has been provisioned or not.
      `,
      tableCellFormatter: function(status) {
        this.start('span').add(status.label).end();
      }
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name to identify user'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.ascendantfx.AscendantFXHoldingAccount',
      name: 'holdingAccounts',
      javaFactory: 'return new AscendantFXHoldingAccount[0];',
      documentation: 'Ascendant Holding Accounts.'
    },
  ]
});
