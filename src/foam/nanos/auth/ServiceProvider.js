/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProvider',
  extends: 'foam.nanos.crunch.Capability',

  documentation: 'Service Provider Capability',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.stream.Collectors',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'Service provider name',
      validationPredicates: [
        {
          args: ['id'],
          predicateFactory: function(e) {
            return e.REG_EXP(foam.nanos.auth.ServiceProvider.ID, /^[a-z0-9]+$/);
          },
          errorString: 'Invalid character(s) in id.'
        }
      ]
    },
    {
      class: 'String',
      name: 'name',
      javaFactory: `
        return "*".equals(getId()) ? "Global Service Provider Capability" :
          getId().substring(0, 1).toUpperCase() + getId().substring(1) + " Service Provider Capability";
      `
    },
    {
      name: 'inherentPermissions',
      javaGetter: `return new String[] {
        "serviceprovider.read." + getId(),
        "serviceproviderdao.read." + getId()
      };`,
      factory: function() {
        return [
          'serviceprovider.read.' + this.id,
          'serviceproviderdao.read.' + this.id
        ];
      },
      documentation: 'Service provider must have "serviceprovider.read.<SPID>" inherent permission.',
    }
  ],

  methods: [
    {
      name: 'grantsPermission',
      javaCode: `
        return super.grantsPermission(permission) || prerequisiteImplies(getX(), permission);
      `
    },
    {
      name: 'getPrereqsChainedStatus',
      documentation: `
        Override the need to have prereqs fulfilled for ServiceProvider capabilities, since the ServiceProvider
        capability implies the permissions of its prerequisites
      `,
      javaCode: `
        return CapabilityJunctionStatus.GRANTED; 
      `
    },
    {
      name: 'setupSpid',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      documentation: `
        Creates a userCapabilityJunction with this ServiceProvider
      `,
      javaCode: `
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        crunchService.updateUserJunction(x, new Subject(user), getId(), null, CapabilityJunctionStatus.GRANTED);
      `
    },
    {
      name: 'removeSpid',
      args: [
        { name: 'x',    javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      documentation: `
        Called when a user spid changes to the this
        Removes any other spid Capabilities the user has
      `,
      javaCode: `
        CrunchService crunchService             = (CrunchService) x.get("crunchService");
        DAO           userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");

        // find list of old spids to remove from user
        AbstractPredicate serviceProviderTargetPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            UserCapabilityJunction ucJunction = (UserCapabilityJunction) obj;
            Capability c = (Capability) ucJunction.findTargetId(x);
            return c instanceof ServiceProvider;
          }
        };
        userCapabilityJunctionDAO.where(AND(
          EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
          NEQ(UserCapabilityJunction.TARGET_ID, getId()),
          serviceProviderTargetPredicate
        )).removeAll();
      `
    }
  ]
});
