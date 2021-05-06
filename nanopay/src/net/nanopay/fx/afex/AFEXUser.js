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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXUser',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'afexBeneficiaryDAO',
    'userDAO',
    'publicBusinessDAO'
  ],

  messages: [
    { name: 'APPROVED_MSG', message: 'Approved' },
    { name: 'BENEFICIARIES_MSG', message: 'Beneficiaries for' },
    { name: 'PENDING_MSG', messages: 'Pending' }
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
      documentation: `The ID for the user`,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.__subSubContext__.userDAO.find(value).then( function( user ) {
          if ( user ) self.add(user.toSummary());
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
      documentation: 'Beneficiary status on AFEX system.',
      tableCellFormatter: function(val, obj) {
        this.add(val === 'Pending' ? obj.PENDING_MSG : obj.APPROVED_MSG);
      }
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

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        return `AFEX User#${this.id}`;
      },
      javaCode: `
        return "AFEX User#" + getId();
      `
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
            var dao = X.afexBeneficiaryDAO.where(m.EQ(net.nanopay.fx.afex.AFEXBeneficiary.OWNER, self.user));
            self.__context__.stack.push({
              class: 'foam.comics.v2.DAOBrowseControllerView',
              data: dao,
              config: {
                class: 'foam.comics.v2.DAOControllerConfig',
                dao: dao,
                createPredicate: foam.mlang.predicate.False,
                editPredicate: foam.mlang.predicate.True,
                browseTitle: `${self.BENEFICIARIES_MSG} ${user.businessName || user.organization}`
              }
            });
          }
        });
      }
    },
  ]
});
