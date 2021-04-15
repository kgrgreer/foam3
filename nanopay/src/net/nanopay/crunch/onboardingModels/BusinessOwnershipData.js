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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessOwnershipData',
  topics: ['ownersUpdate'],
  mixins: ['foam.u2.wizard.AbstractWizardletAware'],
  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],
  javaImports: [
    'foam.core.FObject',
    'foam.core.Validatable'
  ],
  imports: [
    'auth',
    'businessEmployeeDAO',
    'signingOfficerJunctionDAO',
    'subject'
  ],

  messages: [
    { name: 'TOTAL_OWNERSHIP_ERROR', message: 'The total ownership should be less than 100%' },
    { name: 'SIGNINGOFFICER_DATA_FETCHING_ERR', message: 'Failed to find this signing officer info' },
    { name: 'ADD_MSG', message: 'owner' },
    { name: 'HAVE_NO_OWNER_MSG', message: 'I declare that all owners have less than 25% shares each' },
    { name: 'NO_OWNER_INFO_ERR', message: 'Owner information required' }
  ],

  sections: [
    {
      name: 'ownershipAmountSection',
      title: 'Enter the number of people who own 25% or more of the business either directly or indirectly.',
      help: `In accordance with banking laws, we need to document the percentage of ownership of any individual with a 25% + stake in the company.
      Please have owner address and date of birth ready.`,
    },
    {
      name: 'ownerDetailsSection'
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      factory: function() {
        return this.subject.user.id;
      },
      hidden: true
    },
    {
      name: 'soUsersDAO',
      documentation: `this property converts SigningOfficer Users to BeneficialOwners,
      as a way of mini pre-processing for owner selections.`,
      factory: function() {
        var x = this.__subContext__;
        var daoSpec = { of: this.ownerClass };
        var adao = foam.dao.ArrayDAO.create(daoSpec);
        var pdao = foam.dao.PromisedDAO.create(daoSpec);

        var index = 0;
        var sinkFn = so => {
          var obj = this.ownerClass.create({
            id: so.id,
            business: this.businessId,
            mode: 'percent'
          }, x).fromUser(so);
          adao.put(obj);
        };

        this.signingOfficerJunctionDAO
          .where(this.EQ(net.nanopay.model.BusinessUserJunction
            .SOURCE_ID, this.businessId))
          .select(this.PROJECTION(net.nanopay.model.BusinessUserJunction
            .TARGET_ID))
          .then(sos => {
            this.businessEmployeeDAO
              .where(this.IN(foam.nanos.auth.User.ID, sos.projection))
              .select({ put: sinkFn })
              .then(() => pdao.promise.resolve(adao));
          });
        return pdao;
      },
      hidden: true
    },
    {
      name: 'availableUsers',
      expression: function (soUsersDAO, owners) {
        return soUsersDAO.where(this.NOT(this.IN(
          this.ownerClass.ID, owners.map(owner => owner.id)
        )));
      },
      hidden: true
    },
    {
      name: 'ownerPropertySub',
      class: 'FObjectProperty',
      documentation: `
        This object holds subscriptions to properties of all BeneficialOwner
        objects in the 'owners' array.
      `,
      factory: function () {
        return foam.core.FObject.create();
      },
      hidden: true
    },
    {
      name: 'selectionView',
      factory: function() {
        return 'net.nanopay.crunch.onboardingModels.BeneficialOwnerSelectionView';
      },
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'haveLowShares',
      documentation: 'true if all the owners/shareholders have less than 25% shares each and false otherwise',
      label: '',
      section: 'ownershipAmountSection',
      order: 10,
      visibility: function(owners) {
        return owners.length > 0 ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label: X.data.HAVE_NO_OWNER_MSG
        }
      },
      postSet: function(_, newVal) {
        if (newVal) {
          this.owners = [];
        }
      }
    },
    {
      name: 'owners',
      label: 'Owner details',
      class: 'FObjectArray',
      section: 'ownershipAmountSection',
      order: 20,
      of: 'net.nanopay.model.BeneficialOwner',
      validationStyleEnabled: false,
      visibility: function(haveLowShares) {
        return haveLowShares ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      validationPredicates: [
        {
          args: ['owners', 'haveLowShares'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.HAVE_LOW_SHARES, true),
              e.HAS(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.OWNERS)
            );
          },
          errorMessage: 'NO_OWNER_INFO_ERR'
        }
      ],
      view: function (_, X) {
        return {
          class: 'net.nanopay.sme.onboarding.BusinessDirectorArrayView',
          of: X.data.ownerClass,
          defaultNewItem: X.data.ownerClass.create({ mode: 'blank' }, X),
          enableAdding$: X.data.owners$.map(a =>
            // Maximum of 4 beneficial owners
            a.length < 4 &&
            // Last item, if present, must have a selection made
            ( a.length == 0 || a[a.length-1].mode != 'blank' )
          ),
          name: X.data.ADD_MSG,
          valueView: () => ({
            class: X.data.selectionView,

            // ???: If this ViewSpec took the context of this model, these could
            //      be imported instead of passed like this.
            soUsersDAO: X.data.soUsersDAO,
            choiceDAO$: X.data.availableUsers$,
            ownerClass: X.data.ownerClass,
            businessId: X.data.businessId,
            beneficialOwnerSelectionUpdate: X.data.ownersUpdate
          })
        }
      }
    },
    {
      name: 'totalOwnership',
      class: 'Long',
      section: 'ownershipAmountSection',
      order: 30,
      view: {
        class: 'foam.u2.view.ModeAltView',
        writeView: { class: 'foam.u2.view.ValueView' }
      },
      validationTextVisible: true,
      validationPredicates: [
        {
          args: ['totalOwnership'],
          predicateFactory: function(e) {
            return e.LTE(
              net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .TOTAL_OWNERSHIP,
              100);
          },
          errorMessage: 'TOTAL_OWNERSHIP_ERROR'
        }
      ],
      visibility: function (totalOwnership) {
        return Number(totalOwnership) > 100
          ? foam.u2.DisplayMode.RW
          : foam.u2.DisplayMode.HIDDEN ;
      }
    },
    {
      name: 'ownerClass',
      class: 'Class',
      factory: function () {
        return typeof this.OWNERS.of == 'string'
          ? this.__subContext__.lookup(this.OWNERS.of)
          : this.OWNERS.of ;
      },
      hidden: true
    }
  ],

  methods: [
    async function init() {
      if ( await this.auth.check(null, 'net.nanopay.crunch.onboardingmodels.businessownershipdata.viewownersdetails') ) {
        this.owners.map((o) => {
          o.showFullOwnerDetails = true;
        });
      }
      this.ownersUpdate.sub(this.updateOwnersListeners);
      this.owners$.sub(this.updateOwnersListeners);
    },
    function installInWizardlet(w) {
      w.reloadAfterSave = false;
    },
    {
      name: 'validate',
      javaCode: `
        for ( Validatable bo : getOwners() ) {
          bo.validate(x);
        }
        FObject.super.validate(x);
      `
    }
  ],

  listeners: [
    function updateOwnersListeners() {
      this.updateTotalOwnership();
      this.ownerPropertySub.detach();
      this.ownerPropertySub = foam.core.FObject.create();
      var sub = this.ownerPropertySub;
      for ( let owner of this.owners ) {
        sub.onDetach(owner.ownershipPercent$.sub(this.updateTotalOwnership));
      }
    },
    function updateTotalOwnership() {
      this.totalOwnership = this.owners.map(o => o.ownershipPercent)
        .reduce((a, b) => a + b, 0);
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BeneficialOwnerSelectionView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.borders.CardBorder',
    'foam.u2.borders.Block'
  ],

  messages: [
    { name: 'PLEASE_SELECT_ONE', message: 'Please select one of the following...' },
    { name: 'NEW_OWNER_MSG', message: 'Add Owner' }
  ],

  properties: [
    'beneficialOwnerSelectionUpdate',
    'soUsersDAO',
    'choiceSections',
    'ownerClass',
    'businessId',
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceView',
      value: { class: 'foam.u2.view.RichChoiceView' }
    },
    {
      name: 'choiceDAO',
    },
    {
      name: 'hasData_',
      class: 'Boolean',
      documentation: `
        Used to update a slot only when data's truthy value changes.
      `,
      expression: function (data) {
        this.beneficialOwnerSelectionUpdate.pub();
        return data && data.mode != 'blank';
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      const HEADER = 'h4';
      this.start(this.CardBorder)
        .add(this.slot(function (hasData_) {
          if ( hasData_ ) return self.E();
          return self.E()
            .start(HEADER)
              .add(self.NEW_OWNER_MSG)
            .end()
            .start(self.Block)
              .tag(self.choiceView, {
                fullObject_$: self.data$,
                choosePlaceholder: self.PLEASE_SELECT_ONE,
                clearOnReopen: false,
                sections: [
                  {
                    dao$: this.soUsersDAO$,
                    filteredDAO$: this.choiceDAO$
                  },
                  { dao: (() => {
                    var otherChoiceDAO = foam.dao.MDAO.create({ of: self.ownerClass });
                    var obj = self.ownerClass.create({
                      business: self.businessId
                    }, self.__subSubContext__);
                    obj.toSummary = () => self.NEW_OWNER_MSG;
                    otherChoiceDAO.put(obj);

                    return otherChoiceDAO;
                  })() }
                ]
              })
            .end()
        }))
        .add(this.slot(function (hasData_) {
          if ( ! hasData_ ) return self.E();
          return self.E()
            // Display first and last if those fields aren't editable
            .add(self.slot(function (data$mode) {
              if ( data$mode != 'percent' ) return self.E()
                .start(HEADER)
                  .add(self.NEW_OWNER_MSG)
                .end();
              return self.E()
                .start(HEADER)
                  .add(`${self.data.firstName} ${self.data.lastName}`)
                .end();
            }))
            // Display owner fields for user to fill out
            .start(self.Block)
              .tag({
                class: 'foam.u2.detail.SectionView',
                sectionName: 'requiredSection',
                showTitle: false
              }, { data$: self.data$ })
            .end()
        }))
    }
  ]

});
