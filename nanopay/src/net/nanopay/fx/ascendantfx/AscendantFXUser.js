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

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXUser',

  documentation: 'Mapping for nanoPay User to AscendantFX Payee',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
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

  tableColumns: [
    'id',
    'name',
    'userStatus',
    'user.businessName',
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
      visibility: 'RO'
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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent who created the entry'
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
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent'
    }
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
