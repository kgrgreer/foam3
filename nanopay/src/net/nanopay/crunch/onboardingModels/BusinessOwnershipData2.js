foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessOwnershipData2',

  topics: ['ownersUpdate'],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'businessEmployeeDAO',
    'signingOfficerJunctionDAO',
    'subject'
  ],

  messages: [
    { name: 'TOTAL_OWNERSHIP_ERROR', message: 'The total ownership should be less than 100%' },
    { name: 'OTHER_MSG', message: 'Add another owner' }
  ],

  sections: [
    {
      name: 'ownershipAmountSection',
      // TODO: This is not a title.
      title: 'Enter the number of people who own 25% or more of the business either directly or indirectly.',
      navTitle: 'Number of owners',
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
        console.log('--', this);
        var self = this;
        var x = this.__subContext__;
        console.log('--x', this.__subContext__);
        var daoSpec = { of: this.ownerClass };
        var adao = foam.dao.ArrayDAO.create(daoSpec);
        var pdao = foam.dao.PromisedDAO.create(daoSpec);

        var sinkFn = so => {
          var obj = this.ownerClass.create({
            id: ++self.index,
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
      expression: function (soUsersDAO) {
        return soUsersDAO;
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
      name: 'owners',
      class: 'FObjectArray',
      of: 'net.nanopay.model.BeneficialOwner',
      autoValidate: true,
      view: function (_, X) {
        console.log('thtisthis', X.data);
        X.data.owners$.sub(() => console.log('A'));
        var otherChoiceDAO = foam.dao.MDAO.create({ of: X.data.ownerClass });
        var obj = X.data.ownerClass.create({
          business: X.data.businessId
        }, X);
        obj.toSummary = () => X.data.OTHER_MSG;
        otherChoiceDAO.put(obj);

        return {
          class: 'foam.u2.view.FObjectArrayView',
          of: X.data.ownerClass,
          defaultNewItem: X.data.ownerClass.create({ mode: 'blank' }, X),
          enableAdding$: X.data.owners$.map(a => a.length < 4),
          valueView: {
            class: 'net.nanopay.crunch.onboardingModels.BeneficialOwnerSelectionView',

            // ???: If this ViewSpec took the context of this model, these could
            //      be imported instead of passed like this.
            soUsersDAO: X.data.soUsersDAO,
            choiceSections: [
              { dao$: X.data.availableUsers$ },
              { dao: otherChoiceDAO }
            ],
            beneficialOwnerSelectionUpdate: X.data.ownersUpdate
          }
        }
      }
    },
    {
      name: 'totalOwnership',
      class: 'Long',

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
              net.nanopay.crunch.onboardingModels.BusinessOwnershipData2
                .TOTAL_OWNERSHIP,
              100);
          },
          errorMessage: 'TOTAL_OWNERSHIP_ERROR'
        }
      ]
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
    function init() {
      this.ownersUpdate.sub(this.updateOwnersListeners);
      this.owners$.sub(this.updateOwnersListeners);
    }
  ],

  listeners: [
    function updateOwnersListeners() {
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
    // Card border is needed for clear separation between owners
    'foam.u2.borders.CardBorder'
  ],

  messages: [
    { name: 'PLEASE_SELECT_ONE', message: 'Please select one of the following...' },
  ],

  properties: [
    'beneficialOwnerSelectionUpdate',
    'soUsersDAO',
    'choiceSections',
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
    function init() {
      console.log('testing obj', this);
    },
    function initE() {
      var self = this;
      this.start(this.CardBorder)
        .add(this.slot(function (hasData_) {
          if ( hasData_ ) return self.E();
          return self.E()
            .tag(self.choiceView, {
              fullObject_$: self.data$,
              choosePlaceholder: this.PLEASE_SELECT_ONE,
              sections: self.choiceSections
            })
        }))
        .add(this.slot(function (hasData_) {
          if ( ! hasData_ ) return self.E();
          return self.E()
            // Display first and last if those fields aren't editable
            .add(self.slot(function (data$mode) {
              if ( data$mode != 'percent' ) return self.E();
              return self.E()
                .start('h4')
                  .add(`${self.data.firstName} ${self.data.lastName}`)
                .end()
            }))
            // Display owner fields for user to fill out
            .tag({
              class: 'foam.u2.detail.SectionView',
              sectionName: 'requiredSection',
              showTitle: false
            }, { data$: self.data$ })
        }))
    }
  ]

});
