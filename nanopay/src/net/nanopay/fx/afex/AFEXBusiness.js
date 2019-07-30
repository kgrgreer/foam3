foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusiness',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'afexBeneficiaryDAO',
    'userDAO',
    'publicBusinessDAO'
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
      documentation: `The ID for the user`,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.__subSubContext__.publicBusinessDAO.find(value).then( function( user ) {
          if ( user ) self.add(user.businessName);
        });
      }
    },
    {
      class: 'String',
      name: 'apiKey',
      documentation: 'API Key for the business.'
    },
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'AFEX account number'
    },
    {
      class: 'String',
      name: 'status',
      value: 'Pending',
      documentation: 'Beneficiary status on AFEX system.'
    },
    {
      class: 'DateTime',
      name: 'created',
      label: 'Creation Date',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy'
    }
  ],

  actions: [
    {
      name: 'viewBeneficiaries',
      label: 'View Beneficiaries',
      tableWidth: 135,
      code: function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        var self = this;
          X.userDAO.find(this.user).then(function(user) {
            if ( user ) {
              self.__context__.stack.push({
                class: 'foam.comics.BrowserView',
                createEnabled: false,
                editEnabled: true,
                exportEnabled: true,
                title: `${user.businessName}'s Beneficiaries`,
                data: X.afexBeneficiaryDAO.where(m.EQ(net.nanopay.fx.afex.AFEXBeneficiary.OWNER, self.user))
              });
            }
          });
      }
    },
  ]
});
