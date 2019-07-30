
foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXUser',

  documentation: 'Mapping for nanoPay User to AscendantFX Payee',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.mlang.MLang',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.FXUserStatus',
    'static foam.mlang.MLang.EQ'
  ],

  searchColumns: [],

  tableColumns: [
    'id',
    'name',
    'userStatus',
    'user',
    'orgId',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
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
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          search: true,
          sections: [
            {
              heading: 'Business Users',
              dao: X.publicBusinessDAO,
              objToChoice: function(a) {
                return [a.id, a.businessName];
              }
            }
          ]
        };
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
      documentation: 'Ascendant Holding Accounts.',
      hidden: true
    },
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public String getUserAscendantFXOrgId(X x, long userId) throws RuntimeException {
              String orgId = null;
              DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
              final AscendantFXUser ascendantFXUser = (AscendantFXUser) ascendantFXUserDAO.find(MLang.AND(
                            MLang.EQ(AscendantFXUser.USER, userId),
                            MLang.EQ(AscendantFXUser.USER_STATUS, FXUserStatus.ACTIVE)
                    ));

              if ( null != ascendantFXUser && ! SafetyUtil.isEmpty(ascendantFXUser.getOrgId()) ) orgId = ascendantFXUser.getOrgId();

              if ( SafetyUtil.isEmpty(orgId) ) {
                ((Logger) x.get("logger")).error("Unable to find Ascendant Organization ID for User: " + userId);
                throw new RuntimeException("User is not provisioned for foreign exchange transactions yet, please contact customer support.");
              }

              return orgId;
            }
        `);
      }
    }
  ]
});
