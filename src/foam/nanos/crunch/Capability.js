/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Capability',

  implements: [
    'foam.nanos.auth.LifecycleAware'
  ],

  imports: [
    'capabilityDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'java.util.List',
    'javax.security.auth.AuthPermission',
    'static foam.mlang.MLang.*'
  ],

  requires: [
    'foam.u2.crunch.EasyCrunchWizard'
  ],

  tableColumns: [
    'id',
    'name',
    'description',
    'version',
    'lifecycleState',
    'expiry',
    'daoKey'
  ],

  sections: [
    {
      name: '_defaultSection',
      title: 'Administrative',
      permissionRequired: true
    },
    {
      name: 'basicInfo',
      title: 'Basic Info'
    },
    {
      name: 'uiSettings',
      title: 'UI Settings',
      help: 'These properties are used to control how this capability appears in the GUI.',
      permissionRequired: true
    },
    {
      name: 'capabilityRelationships',
      title: 'Capability Relationships',
      permissionRequired: true
    }
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      displayWidth: 40,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'basicInfo'
    },
    {
      name: 'name',
      class: 'String',
      displayWidth: 70,
      section: 'basicInfo',
      includeInDigest: false
    },
    {
      name: 'icon',
      class: 'Image',
      documentation: `Path to capability icon`,
      section: 'uiSettings',
      view: {
        class: 'foam.u2.MultiView',
        horizontal: false,
        views: [
          {
            class: 'foam.u2.view.StringView'
          },
          {
            class: 'foam.u2.view.ImageView'
          }
        ]
      },
      includeInDigest: false
    },
    {
      name: 'description',
      class: 'String',
      documentation: `Description of capability`,
      section: 'uiSettings',
      includeInDigest: false
    },
    {
      name: 'notes',
      class: 'String',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12,
        cols: 100
      },
      includeInDigest: false
    },
    {
      name: 'price',
      class: 'Long',
      includeInDigest: true
    },
    {
      name: 'keywords',
      class: 'StringArray',
      includeInDigest: false
    },
    {
      name: 'version',
      class: 'String',
      includeInDigest: true,
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `Datetime of when capability is no longer valid`,
      includeInDigest: true,
    },
    {
      name: 'duration',
      class: 'Int',
      documentation: `To be used in the case where expiry is duration-based, represents the number of DAYS a junction is valid for before expiring.
      The UserCapabilityJunction object will have its expiry configured to a DateTime based on the lower value of the two, expiry and duration`,
      includeInDigest: true,
    },
    {
      name: 'gracePeriod',
      class: 'Int',
      value: 0,
      documentation: `To be used in the case where expiry is duration based, represents the number of DAYS the user can keep permissions
      granted by this capability after the duration runs out.
      If the gracePeriod is greater than 0, the UserCapabilityJunction will set isInGracePeriod property to true
      and set gracePeriod property to be equals to this. Otherwise, the UserCapabilityJunction will
      go into EXPIRED status.`,
      includeInDigest: true,
    },
    {
      name: 'of',
      class: 'Class',
      displayWidth: 70,
      documentation: `Model used to store information required by this credential`,
      includeInDigest: true,
    },
    {
      name: 'inherentPermissions',
      class: 'StringArray',
      documentation: `List of inherent permissions provided by this capability`,
      includeInDigest: true,
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'permissionsGranted',
      class: 'StringArray',
      documentation: `List of permissions granted by this capability`,
      includeInDigest: true,
      view: 'foam.u2.crunch.PermissionsStringArrayView'
    },
    {
      name: 'permissionsIntercepted',
      class: 'StringArray',
      includeInDigest: true,
      documentation: `List of permissions intercepted by this capability`
    },
    {
      name: 'daoKey',
      class: 'String',
      documentation: `
      daoKey.put() done in UserCapabilityJunctionDAO.
      Uses contextDAOFindKey to find object to update/put.`,
      includeInDigest: true
    },
    {
      name: 'contextDAOFindKey',
      class: 'String',
      documentation: 'need to find things dynamically, thus have a string here to specify the object in context to look up.',
      includeInDigest: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'interceptIf',
      networkTransient: true,
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      documentation: 'condition under which the permissions that may be intercepted by this capability will be intercepted.',
      includeInDigest: false
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'availabilityPredicate',
      networkTransient: true,
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      documentation: 'Predicate used to omit or include capabilities from capabilityDAO',
      includeInDigest: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'visibilityPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;',
      documentation: 'Predicate of the visibility for capabilities in the capability store/keyword sections',
      includeInDigest: true
    },
    {
      name: 'grantMode',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityGrantMode',
      value: foam.nanos.crunch.CapabilityGrantMode.AUTOMATIC
    },
    {
      name: 'reviewRequired',
      class: 'Boolean',
      includeInDigest: true,
      permissionRequired: true,
      view: { class: 'foam.u2.CheckBox', showLabel: false }
    },
    {
      name: 'associatedEntity',
      class: 'Enum',
      of: 'foam.nanos.crunch.AssociatedEntity',
      hidden: true,
      permissionRequired: true,
      includeInDigest: true,
      documentation: `
        Denotes which entity in the context subject the capability should be saved to when there are mutiple.
      `,
      factory: () => {
        return foam.nanos.crunch.AssociatedEntity.USER;
      },
      javaFactory: `
        return foam.nanos.crunch.AssociatedEntity.USER;
      `
    },
    {
      class: 'Object',
      name: 'wizardlet',
      documentation: `
        Defines a wizardlet to display this capability in a wizard. This
        wizardlet will display after this capability's prerequisites.
      `,
      hidden: true,
      factory: function() {
        return foam.nanos.crunch.ui.CapabilityWizardlet.create({}, this);
      },
      includeInDigest: false,
    },
    {
      class: 'Object',
      name: 'beforeWizardlet',
      hidden: true,
      documentation: `
        A wizardlet to display before this capability's prerequisites, and only
        if this capability is at the end of a prerequisite group returned by
        CrunchService's getCapabilityPath method.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      name: 'wizardConfig',
      documentation: `
        Configuration placed on top level capabilities defining various
        configuration options supported by client capability wizards.
      `,
      includeInDigest: false,
      factory: function() {
        return this.EasyCrunchWizard.create({}, this);
      }
    },
    {
      name: 'requirementViewTitle',
      class: 'String',
      documentation: `A short introduction displayed as subtitle in CapabilityRequirementView`,
      section: 'uiSettings',
      includeInDigest: false,
    },
    {
      name: 'label',
      class: 'Reference',
      of: 'foam.nanos.fs.FileLabel',
      documentation: 'File label applied to the document for this capability'
    },
    {
      class: 'Boolean',
      name: 'autoSave',
      documentation: 'If false, disable auto save for wizardlets associated to this capability.',
      hidden: true,
      value: true
    },
    {
      class: 'Boolean',
      name: 'isInternalCapability',
      documentation: `The purpose of this is to enable an agent level ccapability that is confidential and not accessible from a user.
      Disables crunchService.isRenewable from propogating anything else in the heirarchy.
      Disables user expiry notifications.
      Disables capability.maybeReOpen()`
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: 'ACTIVE',
      documentation: `
        PENDING - Awaiting action, unusable capability.
        REJECTED - Rejected from system use, unusable capability.
        DELETED - Marked as deleted from system, unusuable capability.
        ACTIVE - Capability is active and can be used.
      `
    },
    {
      class: 'Boolean',
      name: 'enabled',
      visibility: 'HIDDEN',
      value: true,
      transient: true,
      documentation: `Deprecated, use lifecycleState instead.
        This property only exists for auto migration of legacy data`,
      javaSetter: `
        if ( ! val && ! lifecycleStateIsSet_ ){
          setLifecycleState( foam.nanos.auth.LifecycleState.DELETED );
        }
      `
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.name;
      },
      javaCode: `
        return getName();
      `
    },
    {
      name: 'grantsPermission',
      type: 'Boolean',
      args: [
        { name: 'permission', type: 'String' }
      ],
      documentation: `Checks if a permission or capability string is implied by the current capability`,
      javaCode: `
        if ( getLifecycleState() == LifecycleState.DELETED || getLifecycleState() == LifecycleState.REJECTED ) return false;
        for ( String grantedPermission : this.getPermissionsGranted() ) {
          if ( new AuthPermission(grantedPermission).implies(new AuthPermission(permission)) ) return true;
        }
        for ( String inherentPermission : this.getInherentPermissions() ) {
          if ( new AuthPermission(inherentPermission).implies(new AuthPermission(permission)) ) return true;
        }
        return false;
      `
    },
    {
      name: 'implies',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'permission', type: 'String' }
      ],
      documentation: `Checks if a permission or capability string is implied by the current capability or its prereqs`,
      javaCode: `
        if ( this.grantsPermission(permission) ) return true;
        return this.prerequisiteImplies(x, permission);
      `
    },
    {
      name: 'prerequisiteImplies',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'permission', type: 'String' }
      ],
      documentation: `Checks if a permission or capability string is implied by the prerequisites of a capability`,
      javaCode: `
        // temporary prevent infinite loop when checking the permission "predicatedprerequisite.read.*"
        // TODO : prerequisite checking below may be/probably is unnecessary
        if ( PredicatedPrerequisiteCapabilityJunctionDAO.PERMISSION.equals(permission) ) return false;

        CrunchService crunchService = (CrunchService) x.get("crunchService");
        List<Capability> prereqs = crunchService.getCapabilityPath(x, getId(), false, false);
        if ( prereqs != null && prereqs.size() > 0 ) {
          for ( Capability capability : prereqs ) {
            // getCapabilityPath will include the top-level capability in its return list
            if ( getId().equals(capability.getId()) ) continue;
            if ( capability != null && capability.grantsPermission(permission) ) return true;
          }
        }
        return false;
      `
    },
    {
      name: 'isDeprecated',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' }
      ],
      documentation: 'check if a given capability is deprecated',
      javaCode: `
      Sink count = new Count();
      count = this.getDeprecating(x).getJunctionDAO()
        .where(
          EQ(Capability.ID, (String) this.getId())
        ).select(count);

      return ((Count) count).getValue() > 0;
      `
    },
    {
      name: 'isExpired',
      type: 'Boolean',
      documentation: `check if a given capability is expired.`,
      javaCode: `
      if ( getExpiry() == null ) return false;

      Date today = new Date();
      Date capabilityExpiry = getExpiry();

      return today.after(capabilityExpiry);
      `
    },
    {
      name: 'getPrereqsChainedStatus',
      type: 'CapabilityJunctionStatus',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ucj', type: 'UserCapabilityJunction' }
      ],
      documentation: `
        Check statuses of all prerequisite capabilities - returning:
        GRANTED        : If all pre-reqs are in granted status
        PENDING        : If at least one pre-req is in pending/approved status and the rest are granted
        ACTION_REQUIRED: If at least one pre-req is not in pending/approved/granted status
      `,
      javaCode: `
        // CrunchService used to get capability junctions
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        boolean allGranted = true;
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO userDAO = (DAO) x.get("userDAO");
        Subject currentSubject = (Subject) x.get("subject");

        Subject subject = new Subject(x);
        if ( ucj instanceof AgentCapabilityJunction ) {
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
          AgentCapabilityJunction acj = (AgentCapabilityJunction) ucj;
          subject.setUser((User) userDAO.find(acj.getEffectiveUser())); // "user"
        } else if ( ucj.getSourceId() == currentSubject.getUser().getId() ) {
          // Call setUser() twice
          // Because it builds a user path and adds a user to the chain for each setUser()
          subject.setUser(currentSubject.getRealUser());
          subject.setUser(currentSubject.getUser());
        } else {
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
        }

        var prereqs = crunchService.getPrereqs(x, getId(), ucj);
        CapabilityJunctionStatus prereqChainedStatus = null;
        if ( prereqs != null ) {
          for ( var capId : prereqs ) {
            var cap = (Capability) capabilityDAO.find(capId);
            if ( cap == null || cap.getLifecycleState() != foam.nanos.auth.LifecycleState.ACTIVE ) continue;

            UserCapabilityJunction prereqUcj = crunchService.getJunctionForSubject(x, capId, subject);

            prereqChainedStatus = getPrereqChainedStatus(x, ucj, prereqUcj);
            if ( prereqChainedStatus == CapabilityJunctionStatus.ACTION_REQUIRED ) return CapabilityJunctionStatus.ACTION_REQUIRED;
            if ( prereqChainedStatus != CapabilityJunctionStatus.GRANTED ) allGranted = false;
          }
        }
        return allGranted ? CapabilityJunctionStatus.GRANTED : CapabilityJunctionStatus.PENDING;
      `,
    },
    {
      name: 'getPrereqChainedStatus',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' },
        { name: 'prereq', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      static: true,
      javaType: 'foam.nanos.crunch.CapabilityJunctionStatus',
      javaCode: `
        CapabilityJunctionStatus status = ucj.getStatus();

        boolean reviewRequired = getReviewRequired();
        CapabilityJunctionStatus prereqStatus = prereq.getStatus();

        switch ( (CapabilityJunctionStatus) prereqStatus ) {
          case AVAILABLE :
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case ACTION_REQUIRED :
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case PENDING :
            status = reviewRequired &&
              ( status == CapabilityJunctionStatus.APPROVED ||
                status == CapabilityJunctionStatus.GRANTED
              ) ?
                CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING;
            break;
          case APPROVED :
            status = reviewRequired &&
              ( status == CapabilityJunctionStatus.APPROVED ||
                status == CapabilityJunctionStatus.GRANTED
              ) ?
                CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING;
              break;
          case EXPIRED :
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case PENDING_REVIEW :
            // note: this shouldn't happen since PENDING_REVIEW is
            // only used for UI purposes, and ucjs are never stored
            // in this status
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          default :
            status = CapabilityJunctionStatus.GRANTED;
        }
        return status;

      `
    },
    {
      name: 'maybeReopen',
      type: 'Boolean',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      documentation: `
        Returns true if the ucj or one of its prerequistite ucjs of the target capability
        are granted but not in an reopenable state
      `,
      javaCode: `
        if ( getLifecycleState() == LifecycleState.DELETED || getLifecycleState() == LifecycleState.REJECTED ) return false;
        if ( getIsInternalCapability() ) return false;
        if ( getGrantMode() == CapabilityGrantMode.MANUAL ) return false;

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        boolean shouldReopenTopLevel = shouldReopenUserCapabilityJunction(ucj);
        if ( shouldReopenTopLevel ) return true;

        var prereqs = crunchService.getPrereqs(x, getId(), ucj);
        if ( prereqs == null || prereqs.size() == 0 ) return false;

        for ( var capId : prereqs ) {
          Capability cap = (Capability) capabilityDAO.find(capId);
          if ( cap == null || cap.getLifecycleState() != foam.nanos.auth.LifecycleState.ACTIVE ) throw new RuntimeException("Cannot find prerequisite capability");
          UserCapabilityJunction prereq = crunchService.getJunction(x, capId);
          if ( cap.maybeReopen(x, prereq) ) return true;
        }
        return false;
      `
    },
    {
      name: 'shouldReopenUserCapabilityJunction',
      type: 'Boolean',
      args: [
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      javaCode: `
        if ( ucj == null ) return true;
        else if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED && ucj.getIsRenewable() ) return true;
        else if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED &&
                  ucj.getStatus() != CapabilityJunctionStatus.PENDING &&
                  ucj.getStatus() != CapabilityJunctionStatus.APPROVED ) return true;
        return false;
      `
    },
    {
      name: 'getImpliedData',
      documentation: `
        A subclass of Capability can override this to define what gets stored
        when a UCJ is saved with null data.
      `,
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      type: 'FObject',
      javaCode: `
        return null;
      `
    }
  ]
});


foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  extends:'foam.nanos.crunch.Renewable',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.crunch.Capability',
  ids: [ 'id' ],
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'users',
  sourceProperty: {
    section: 'systemInformation',
    order: 20,
    updateVisibility: 'RO',
    columnPermissionRequired: true
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'deprecated',
  inverseName: 'deprecating',
  junctionDAOKey: 'deprecatedCapabilityJunctionDAO',
  sourceProperty: {
    section: 'capabilityRelationships'
  },
  targetProperty: {
    section: 'capabilityRelationships'
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'prerequisites',
  inverseName: 'dependents',
  junctionDAOKey: 'prerequisiteCapabilityJunctionDAO',
  sourceProperty: {
    section: 'capabilityRelationships'
  },
  targetProperty: {
    section: 'capabilityRelationships'
  }
});
