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
  documentation: `
    This model represents the detailed information of a Business Ownership.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  imports: [
    'businessEmployeeDAO',
    'ctrl',
    'signingOfficerJunctionDAO',
    'subject'
  ],

  requires: [
    'net.nanopay.model.BeneficialOwner'
  ],

  javaImports: [
    'net.nanopay.model.BeneficialOwner',
    'java.util.stream.Collectors',
    'java.util.Set',
    'java.util.List'
  ],

  sections: [
    {
      name: 'ownershipAmountSection',
      title: 'How many individuals directly or indirectly own 25% or more of the business?',
      help: `In accordance with banking laws, we need to document the percentage of ownership of any individual with a 25% + stake in the company.
      Please have owner address and date of birth ready.`,
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 1,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 1;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 2,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 2;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 3,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 3;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 4,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 4;
      }
    },
    {
      name: 'reviewOwnersSection',
      title: 'Review the list of owners',
      isAvailable: function(amountOfOwners) {
        return amountOfOwners > 0;
      }
    },
  ],

  messages: [
    { name: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR', message: 'Please select a number of owners' },
    { name: 'INVALID_OWNER_SELECTION_ERROR', message: 'One or more of the owner selection is invalid' },
    { name: 'OWNER_1_ERROR', message: 'Owner1 is invalid' },
    { name: 'OWNER_2_ERROR', message: 'Owner2 is invalid' },
    { name: 'OWNER_3_ERROR', message: 'Owner3 is invalid' },
    { name: 'OWNER_4_ERROR', message: 'Owner4 is invalid' },
    { name: 'TOTAL_OWNERSHIP_ERROR', message: 'The total ownership should be less than 100%' }
  ],

  properties: [
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
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
      name: 'index',
      class: 'Int',
      transient: true,
      hidden: true,
      value: 1
    },
    {
      name: 'soUsersDAO',
      documentation: `this property converts SigningOfficer Users to BeneficialOwners,
      as a way of mini pre-processing for owner selections.`,
      factory: function() {
        var self = this;
        var x = this.ctrl.__subContext__;
        var adao = foam.dao.ArrayDAO.create({
          of: net.nanopay.model.BeneficialOwner
        });
        var pdao = foam.dao.PromisedDAO.create({
          of: net.nanopay.model.BeneficialOwner
        });
        var sinkFn = so => {
          var obj = net.nanopay.model.BeneficialOwner.create(
            {
              id: ++self.index,
              firstName: so.firstName,
              lastName: so.lastName,
              jobTitle: so.jobTitle,
              business: this.subject.user.id,
              address: so.address,
              birthday: so.birthday,
              mode: 'percent'
            }, x);
            adao.put(obj);
        };

        this.signingOfficerJunctionDAO
          .where(this.EQ(net.nanopay.model.BusinessUserJunction
            .SOURCE_ID, this.subject.user.id))
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
      name: 'chosenOwners',
      class: 'List',
      hidden: true,
      storageTransient: true,
      factory: function() {
        return [];
      }
    },
    {
      name: 'ownerSelectionsValidated',
      class: 'Boolean',
      hidden: true,
      storageTransient: true,
      getter: function() {
        return this.amountOfOwners <= 0 ||
          new Set(this.chosenOwners).size === this.amountOfOwners;
      },
      javaGetter: `
      Set<String> ownerSet = (Set<String>) ((List)getChosenOwners()).stream().collect(Collectors.toSet());
      return getAmountOfOwners() <= 0 || ownerSet.size() == getAmountOfOwners();
      `
    },

    // Ownership Amount Section
    {
      section: 'ownershipAmountSection',
      name: 'amountOfOwners',
      class: 'Int',
      documentation: 'Number of owners',
      label: '',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          0, 1, 2, 3, 4
        ],
        isHorizontal: true
      },
      validationPredicates: [
        {
          args: ['amountOfOwners'],
          predicateFactory: function(e) {
            return e.AND(
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 0),
              e.LTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 4)
            );
          },
          errorMessage: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR'
        },
        {
          args: ['ownerSelectionsValidated', 'owner1', 'owner2', 'owner3', 'owner4', 'chosenOwners'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.onboardingModels
              .BusinessOwnershipData.OWNER_SELECTIONS_VALIDATED, true);
          }
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'publiclyTraded',
      section: 'ownershipAmountSection',
      documentation: 'Whether this is a publicly traded company.',
      label: 'This is a publicly traded company',
      postSet: function(_, n) {
        if ( n ) this.clearAllOwnerAndPercentData();
      },
      visibility: function(amountOfOwners) {
        return amountOfOwners == 0 ?
          foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      index: 1,
      documentation: 'First owner',
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner1$errors_'],
        predicateFactory: function(e) {
          return e.OR(
            e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .AMOUNT_OF_OWNERS, 1),
            e.AND(
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 1),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER1']
              }), true)
            )
          );
        },
        errorMessage: 'OWNER_1_ERROR'
      }
     ]
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      index: 2,
      documentation: 'Second owner',
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner2$errors_'],
        predicateFactory: function(e) {
          return e.OR(
            e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .AMOUNT_OF_OWNERS, 2),
            e.AND(
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 2),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER2']
              }), true)
            )
          );
        },
        errorMessage: 'OWNER_2_ERROR'
      }
     ]
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      index: 3,
      documentation: 'Third owner',
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner3$errors_'],
        predicateFactory: function(e) {
          return e.OR(
            e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .AMOUNT_OF_OWNERS, 3),
            e.AND(
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 3),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER3']
              }), true)
            )
          );
        },
        errorMessage: 'OWNER_3_ERROR'
      }
     ]
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      index: 4,
      documentation: 'Forth owner',
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner4$errors_'],
        predicateFactory: function(e) {
          return e.OR(
            e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .AMOUNT_OF_OWNERS, 4),
            e.AND(
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 4),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER4']
              }), true)
            )
          );
        },
        errorMessage: 'OWNER_4_ERROR'
      }
     ]
    },

    // Review Owners Section
    {
      name: 'beneficialOwnersTable',
      flags: ['web'],
      label: '',
      section: 'reviewOwnersSection',
      transient: true,
      cloneProperty: function() {},
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: 'net.nanopay.model.BeneficialOwner',
          seqNo: true,
          daoType: 'MDAO'
        });
      },
      postSet: function() {
        this.updateTable();
      },
      view: {
        class: 'foam.u2.view.TableView',
        editColumnsEnabled: false,
        disableUserSelection: true,
        columns: [
          'firstName',
          'lastName',
          'jobTitle',
          'ownershipPercent'
        ]
      },
      visibility: function(amountOfOwners) {
        return amountOfOwners > 0 ?
          foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      section: 'reviewOwnersSection',
      name: 'totalOwnership',
      class: 'Long',
      view: {
        class: 'foam.u2.view.ModeAltView',
        writeView: { class: 'foam.u2.view.ValueView' }
      },
      expression: function(amountOfOwners,
                           owner1$ownershipPercent,
                           owner2$ownershipPercent,
                           owner3$ownershipPercent,
                           owner4$ownershipPercent) {
        var sum = 0;

        if ( amountOfOwners >= 1 ) sum += owner1$ownershipPercent;
        if ( amountOfOwners >= 2 ) sum += owner2$ownershipPercent;
        if ( amountOfOwners >= 3 ) sum += owner3$ownershipPercent;
        if ( amountOfOwners >= 4 ) sum += owner4$ownershipPercent;

        return sum;
      },
      javaGetter: `
        int sum = 0;

        if ( getAmountOfOwners() >= 1 && getOwner1() != null ) sum += getOwner1().getOwnershipPercent();
        if ( getAmountOfOwners() >= 2 && getOwner2() != null ) sum += getOwner2().getOwnershipPercent();
        if ( getAmountOfOwners() >= 3 && getOwner3() != null ) sum += getOwner3().getOwnershipPercent();
        if ( getAmountOfOwners() >= 4 && getOwner4() != null ) sum += getOwner4().getOwnershipPercent();

        return sum;
      `,
      visibility: function(totalOwnership) {
        return Number(totalOwnership) > 100 ?
          foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      autoValidate: true,
      max: 100,
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
      ]
    }
  ],

  reactions: [
    ['', 'propertyChange.amountOfOwners', 'clearAllOwnerAndPercentData']
  ].concat([1, 2, 3, 4].map((i) => [
    [`owner${i}`, 'propertyChange', 'updateTable'],
    ['', `propertyChange.owner${i}`, 'updateTable']
  ]).flat()),

  listeners: [
    {
      name: 'updateTable',
      isFramed: true,
      code: function() {
        this.beneficialOwnersTable.removeAll().then(() => {
          for ( var i = 1; i <= this.amountOfOwners; i++ ) {
            if ( this['owner'+i] ) {
              this.beneficialOwnersTable.put(this['owner'+i]);
            }
          }
        });
      }
    },
    {
      name: 'clearAllOwnerAndPercentData',
      isFramed: true,
      code: function() {
        this.chosenOwners = [];
        this.ownerSelectionsValidated = false;
        this.owner1 = this.owner2 = this.owner3 = this.owner4 = undefined;
        this.beneficialOwnersTable.removeAll();
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }

        // validate BeneficialOwner objects
        BeneficialOwner[] owners = new BeneficialOwner[]{ getOwner1(), getOwner2(), getOwner3(), getOwner4() };
        for ( int i = 0 ; i < getAmountOfOwners(); i++ ) owners[i].validate(x);
      `
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'OwnerSection',
  extends: 'foam.layout.SectionAxiom',
  properties: [
    {
      class: 'Int',
      name: 'index'
    },
    {
      name: 'name',
      expression: function(index) {
        return `owner${index}Section`;
      }
    },
    {
      name: 'title',
      expression: function(index) {
        return `Add details for owner #${index}`;
      }
    },
    {
      name: 'isAvailable',
      factory: function() {
        var i = this.index;
        return function(amountOfOwners) {
          return amountOfOwners >= i;
        };
      },
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'OwnerProperty',
  extends: 'foam.core.FObjectProperty',
  properties: [
    ['of', 'net.nanopay.model.BeneficialOwner'],
    {
      class: 'Int',
      name: 'index'
    },
    {
      name: 'name',
      expression: function(index) {
        return `owner${index}`;
      }
    },
    {
      name: 'section',
      expression: function(index) {
        return `owner${index}Section`;
      }
    },
    {
      name: 'label',
      value: ''
    },
    {
      name: 'view',
      value: function(_, X) {
        var dao2 = X.data.slot((soUsersDAO) => soUsersDAO);
        var dao = foam.dao.MDAO.create({
            of: net.nanopay.model.BeneficialOwner
          });

        var user = X.data.subject.user;
          // note: the one access to businessId(below) ensures the prop is set on obj as it travels through network
        var obj = net.nanopay.model.BeneficialOwner.create({
            business: X.data.businessId,
            type: user.address.countryId,
            id: 1
          }, X);
        obj.toSummary = () => 'Other';
        dao.put(obj);
        return {
          class: 'net.nanopay.crunch.onboardingModels.SelectionViewOwner',
          dao2$: dao2,
          dao: dao,
          index: this.index,
          chosenOwners: X.data.chosenOwners,
          choiceView:
          {
            class: 'foam.u2.view.RichChoiceView',
            choosePlaceholder: 'Please select one of the following...',
            sections: ['Owner type']
          }
        };
      }
    },
    {
      name: 'preSet',
      value: function(o, n) {
        if ( ! n ) return n;
        if ( ! n.id || n.id === 1 ) {
          n.id = ++this.index;
        }
        this.chosenOwners.push(n.id);
        if ( o ) {
          this.chosenOwners.splice(this.chosenOwners.indexOf(o.id), 1);
        }
        return n;
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SelectionViewOwner',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'notify'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.layout.Rows'
  ],

  messages: [
    {
      name: 'OTHER_SELECTION',
      message: 'If owner is not a Signing Officer, please select the following...'
    },
    {
      name: 'SO_SELECTION',
      message: 'Please select one of the following Signing Officers...'
    },
    {
      name: 'CHOICEDATA_POSTSET_ERR',
      message: 'Unexpected error @ choiceData_ postset net.nanopay.crunch.onboardingModels.SectionViewOwner'
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'index'
    },
    {
      class: 'List',
      name: 'chosenOwners'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceView',
      required: true
    },
    {
      name: 'dao2',
      class: 'foam.dao.DAOProperty',
      documentation: 'dao that is used in choiceView, should not change.'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      documentation: 'dao that is used in choiceView, should not change.',
    },
    {
      name: 'otherLabel',
      class: 'String'
    },
    {
      name: 'choiceData_',
      documentation: 'Data that is set by choiceView(reference object)',
      postSet: async function(o, n) {
        // checks if data already exists
        const dataExists = this.data && n === this.data.id;

        try {
          const numSO = (await this.dao2.select(this.COUNT())).value;
          // checks if a signing officer is selected
          // Note: Signing officer id is between 2 and numSO + 1 inclusive while
          // nonsigning officer data has id > numSO + 1. If n === 1, 'other' is selected
          // but data doesn't exist.
          if ( n > 1 && n < numSO + 2 ) {
            if ( ! dataExists ) {
              const selectedSO = await this.dao2.find(n);
              this.data = selectedSO ? selectedSO.clone() : selectedSO;
            }
            this.updateSections_(n);

          // 'other' is selected
          } else if ( ! dataExists ) {
            const other = await this.dao.find(n);
            this.data = other ? other.clone() : other;
          }
        } catch (e) {
          this.notify(this.CHOICEDATA_POSTSET_ERR, '', this.LogLevel.ERROR, true);
        }
      }
    },
    {
      name: 'choiceSections_',
      documentation: 'Sections displayed in the choice view',
      class: 'Array'
    }
  ],

  reactions: [
    ['', 'propertyChange.data', 'fromData']
  ],

  listeners: [
    {
      name: 'fromData',
      code: function() {
        if ( ! this.data ) {
          this.choiceData_ = undefined;
        } else if ( ! this.choiceData_ ) {
          this.choiceData_ = this.data.id;
        }
      }
    }
  ],

  methods: [
    function init() {
      // Pre-initialize with just one section to prevent empty array error
      // thrown by RichChoiceView
      this.updateSections_(-1);
    },
    function initE() {
      this.add(this.slot((choiceData_, choiceSections_) => {
        return this.Rows.create()
          .tag(this.choiceView, {
            data$: this.choiceData_$,
            sections: this.choiceSections_
          }, this.choiceView_$)
          .start()
            .tag({
              class: 'foam.u2.detail.SectionView',
              sectionName: 'requiredSection',
              showTitle: false
            }, { data$: this.data$ })
          .end();
        }
      ));
    },
    function updateSections_(choice) {
      var choiceSections = [];

      choiceSections.push({
        heading: this.SO_SELECTION,
        // filter out all the siging officers except the one chosen by this owner
        dao: this.dao2.where(
          this.OR(
            this.EQ(net.nanopay.model.BeneficialOwner.ID, choice),
            this.NOT(
              this.IN(net.nanopay.model.BeneficialOwner.ID, this.chosenOwners)
            )
          )
        ),
        hideIfEmpty: true
      });

      choiceSections.push({
        heading: this.OTHER_SELECTION,
        dao$: this.dao$
      });

      this.choiceSections_ = choiceSections;
    }
  ]
});
