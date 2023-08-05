/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.UserCapabilityJunction',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.Renewable'
  ],

  mixins: [
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.lite.CapableObjectData'
  ],

  documentation: `
    Model for UserCapabilityJunction, contains the data needed to grant the
    capability to user.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'static foam.nanos.crunch.AssociatedEntity.*',
    'java.time.*',
    'java.util.Date'
  ],

  imports: [
    'capabilityDAO',
    'subject',
    'userDAO'
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction'
  ],

  tableColumns: [
    'sourceId',
    'targetId',
    'status',
    'expiry',
    'gracePeriod',
    'data'
  ],

  messages: [
    { name: 'VIEW_TITLE_USER', message: 'Users' },
    { name: 'VIEW_TITLE_CAP',  message: 'Capabilities' }
  ],

  sections: [
    { name: 'ucjExpirySection' }
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All Expirable',
      predicateFactory: function(e) {
        return e.HAS(
          foam.nanos.crunch.UserCapabilityJunction.EXPIRY
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Renewable',
      predicateFactory: function(e) {
        return e.EQ(
          foam.nanos.crunch.UserCapabilityJunction.IS_IN_RENEWABLE_PERIOD,
          true
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'In Grace Period',
      predicateFactory: function(e) {
        return e.EQ(
          foam.nanos.crunch.UserCapabilityJunction.IS_IN_GRACE_PERIOD,
          true
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Expired',
      predicateFactory: function(e) {
        return e.EQ(
          foam.nanos.crunch.UserCapabilityJunction.IS_EXPIRED,
          true
        );
      }
    },
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'sourceId',
      label: 'User',
      includeInDigest: true,
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReadReferenceView',
            of: 'foam.nanos.auth.User'
          },
          writeView: {
            class: 'foam.u2.view.RichChoiceView',
            search: true,
            sections: [
              {
                heading: x.data.VIEW_TITLE_USER,
                dao: x.userDAO
              }
            ]
          }
        };
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'targetId',
      label: 'Capability',
      includeInDigest: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReadReferenceView',
            of: 'foam.nanos.crunch.Capability'
          },
          writeView: {
            class: 'foam.u2.view.RichChoiceView',
            search: true,
            sections: [
              {
                heading: X.data.VIEW_TITLE_CAP,
                dao: X.capabilityDAO
              }
            ]
          }
        };
      },
      tableWidth: 250,
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.capabilityDAO
          .find(value)
          .then((capability) => {
            this
              .attrs({ title: capability.id })
              .add(capability.name || capability.id)
          })
          .catch((error) => {
            this.add(value);
          });
      },
      menuKeys: ['admin.capabilities']
    },
    {
      name: 'payload',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.UserCapabilityJunction',
      includeInHash: false,
      javaCompare: 'return 0;',
      javaGetter: `
        return this;
      `,
      javaSetter: '',
      javaCloneProperty: '// noop',
      hidden: true,
      externalTransient: true
    },
    {
      name: 'lifecycleState',
      class: 'Enum',
      of: 'foam.nanos.auth.LifecycleState',
      value: 'ACTIVE',
      visibility: 'RO',
      includeInDigest: true,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastUpdatedRealUser',
      documentation: `
        This property is helpful when it's necessary to know which real
        user last changed a capability of an effective user.
      `,
      includeInDigest: true,
    },
    // renewable
    {
      name: 'isExpired',
      includeInDigest: true,
      section: 'ucjExpirySection',
      javaSetter: `
        isExpired_ = val;
        isExpiredIsSet_ = true;
        if ( isExpired_ ) {
          if ( getStatus() != CapabilityJunctionStatus.EXPIRED ) setStatus(CapabilityJunctionStatus.EXPIRED);
          isInGracePeriod_ = false;
        }
      `
    },
    {
      name: 'isRenewable',
      includeInDigest: true,
      section: 'ucjExpirySection'
    },
    {
      name: 'isInRenewablePeriod',
      includeInDigest: true,
      section: 'ucjExpirySection'
    },
    {
      name: 'isInGracePeriod',
      includeInDigest: true,
      section: 'ucjExpirySection'
    },
    {
      name: 'expiry',
      includeInDigest: true,
      section: 'ucjExpirySection'
    },
    {
      name: 'gracePeriod',
      includeInDigest: true,
      section: 'ucjExpirySection'
    },
    {
      class: 'Boolean',
      name: 'skipEditBehaviour',
      writePermissionRequired: true,
      storageTransient: true
    }
  ],

  methods: [
    {
      name: 'saveDataToDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capability',
          type: 'Capability'
        },
        {
          name: 'putObject',
          type: 'Boolean'
        }
      ],
      javaType: 'foam.core.FObject',
      documentation: `
        We may or may not want to store the data in its own dao, based on the nature of the data.
        For example, if the data for some UserCapabilityJunction is a businessOnboarding object, we may want to store this object in
        the businessOnboardingDAO for easier access.
        If the data on an UserCapabilityJunction should be stored in some DAO, the daoKey should be provided on its corresponding Capability object.
      `,
      javaCode: `
        if ( getData() == null )
          throw new RuntimeException("UserCapabilityJunction data not submitted for capability: " + getTargetId());

        String daoKey = capability.getDaoKey();
        if ( daoKey == null ) return null;

        DAO dao = (DAO) x.get(daoKey);
        if ( dao == null ) return null;

        // Identify or create data to go into dao.
        FObject objectToSave;
        String contextDAOFindKey = (String) capability.getContextDAOFindKey();

        if ( contextDAOFindKey != null && ! contextDAOFindKey.isEmpty() ) {
          if ( contextDAOFindKey.toLowerCase().contains("subject") ) {
            // 1- Case if subject lookup
            String[] words = foam.util.StringUtil.split(contextDAOFindKey, '.');
            objectToSave = getSubject(x);

            if ( objectToSave == null || words.length < 2 )
              throw new RuntimeException("@UserCapabilityJunction capability.contextDAOFindKey not found in context. Please check capability: " + getTargetId() + " and its contextDAOFindKey: " + contextDAOFindKey);

            if ( words[1].toLowerCase().equals("user") ) {
              objectToSave = ((Subject) objectToSave).getUser();
            } else if ( words[1].toLowerCase().equals("realuser") ) {
              objectToSave = ((Subject) objectToSave).getRealUser();
            }
            try {
              objectToSave = dao.find(((User)objectToSave).getId());
            } catch(Exception e) {
              throw e;
            }
          } else {
            // 2- Case if anything other then subject specified
            objectToSave = (FObject) x.get(contextDAOFindKey);

            if ( objectToSave == null ) {
              throw new RuntimeException("@UserCapabilityJunction capability.contextDAOFindKey not found in context. Please check capability: " + getTargetId() + " and its contextDAOFindKey: " + contextDAOFindKey);
            }

            if ( objectToSave instanceof User ) {
              objectToSave = dao.find(((User) objectToSave).getId());
            }
          }
          // TODO - the try block above that finds objectToSave from dao - should be moved here
          //        however need to work on casting the (FObject)objectToSave to understand objectToSave.getId()
        } else {
          // 3- Case where contextDAOFindKey not specified:
          try {
            // Create new object of DAO type to copy over properties
            objectToSave = (FObject) dao.getOf().newInstance();
          } catch (Exception e) {
            // 4- default case, try using ucj data directly.
            objectToSave = (FObject) getData();
          }
        }
        if ( dao.getOf().getObjClass().isAssignableFrom(getData().getClass()) ) {
          // skip copy if data is the same class as dao.of or is a super class of dao.of
          objectToSave = (FObject) getData();
        }
        else {
          // finally copy user inputed data into objectToSave <- typed to the safest possibility from above cases
          try {
            objectToSave = objectToSave.fclone().copyFrom(getData());
          } catch (RuntimeException e) {
            Logger logger = (Logger) x.get("logger");
            logger.debug(this.getClass().getSimpleName(), "exception copying data to objectToSave - objectToSave ", objectToSave);
            logger.debug(this.getClass().getSimpleName(), "exception copying data to objectToSave - data ", getData());
            logger.debug(this.getClass().getSimpleName(), "exception copying data to objectToSave - exception ", e);
          }
        }

        // save data to dao
        try {
          if ( putObject ) dao.inX(x).put(objectToSave);
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.warning("Data cannot be added to " + capability.getDaoKey() + " for UserCapabilityJunction object : " + getId() );
          logger.debug(this.getClass().getSimpleName(), "dao.inx.put exception - ", e);
        }

        return objectToSave;
      `
    },
    {
      name: 'getSubject',
      type: 'foam.nanos.auth.Subject',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        UserCapabilityJunction ucj = this;
        var currentSubject = (Subject) x.get("subject");
        var userDAO = (DAO) x.get("bareUserDAO");

        Subject subject = new Subject(x);
        if ( ucj instanceof AgentCapabilityJunction ) {
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
          AgentCapabilityJunction acj = (AgentCapabilityJunction) ucj;
          subject.setUser((User) userDAO.find(acj.getEffectiveUser()));
          return subject;
        }

        // We will need the capability object to know how it's associated
        var capabilityDAO = (DAO) x.get("capabilityDAO");
        var cap = (Capability) capabilityDAO.find(ucj.getTargetId());
        if ( cap == null || cap.getLifecycleState() != foam.nanos.auth.LifecycleState.ACTIVE ) {
          throw new RuntimeException(
            "Tried to call getSubject() on UCJ with unrecognized capability");
        }

        if ( ucj.getSourceId() == currentSubject.getUser().getId() ) {
          // setup user chain
          subject.setUser(currentSubject.getRealUser());
          subject.setUser(currentSubject.getUser());
          return subject;
        }

        if ( cap.getAssociatedEntity() == USER ) {
          subject.setUser((User) userDAO.find(
            0 != ucj.getLastUpdatedRealUser()
              ? ucj.getLastUpdatedRealUser()
              : ucj.getSourceId()
          ));
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
        }

        subject.setUser((User) userDAO.find(ucj.getSourceId()));
        return subject;
      `,
      code: async function () {
        // TODO: Why is 'this' missing some imports and requires?

        if ( foam.nanos.crunch.AgentCapabilityJunction.isInstance(this) ) {
          let user = await this.userDAO.find(this.effectiveUser);
          let realUser = await this.userDAO.find(this.sourceId);
          return foam.nanos.auth.Subject.create(
            { user: user, realUser: realUser }, this.__subContext__);
        }

        var cap = await this.capabilityDAO.find(this.targetId);
        if ( ! cap ) throw new Error(
          'Tried to call getSubject() on UCJ with unrecognized capability');

        if ( this.sourceId == this.__subContext__.subject.user.id )
          return this.subject;

        // TODO: is check for lastUpdatedRealUser needed here?

        var user = await this.__subContext__.userDAO.find(this.sourceId);
        return foam.nanos.auth.Subject.create(
          { user: user, realUser: user }, this.__subContext__);
      }
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return 'UCJ id: '+this.id+', source: '+this.sourceId+', target: '+this.targetId+', status: '+this.status.name+', data: '+( this.data && this.data.cls_ ? this.data.cls_.id : 'null');
      },
      javaCode: `
      return "UCJ id: "+getId()+", source: "+getSourceId()+", target: "+getTargetId()+", status: "+getStatus().getName()+", data: "+(getData() != null ? getData().getClass().getName() : "null");
      `
    },
    {
      name: 'toSummary',
      code: async function () {
        return (await this.targetId$find)?.name + ' for ' +
          (await this.sourceId$find)?.legalName;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AgentCapabilityJunction',
  extends: 'foam.nanos.crunch.UserCapabilityJunction',

  properties: [
    {
      name: 'effectiveUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      documentation: `
        The entity the owner of this capability 'act as'
      `
    }
  ]
})
