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
    'crunchService',
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
      title: 'Enter the number of people who own 25% or more of the business either directly or indirectly.',
      navTitle: 'Number of owners',
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
      title: 'Review the list of owners'
    }
  ],

  messages: [
    { name: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR', message: 'Please select a number of owners' },
    { name: 'INVALID_OWNER_SELECTION_ERROR', message: 'One or more of the owner selection is invalid' },
    { name: 'OWNER_NOT_SELECTED_ERROR', message: 'Please select one of the options from the dropdown' },
    { name: 'OWNER_1_ERROR', message: 'Owner1 is invalid' },
    { name: 'OWNER_2_ERROR', message: 'Owner2 is invalid' },
    { name: 'OWNER_3_ERROR', message: 'Owner3 is invalid' },
    { name: 'OWNER_4_ERROR', message: 'Owner4 is invalid' },
    { name: 'TOTAL_OWNERSHIP_ERROR', message: 'The total ownership should be less than 100%' },
    { name: 'SIGNINGOFFICER_DATA_FETCHING_ERR', message: 'Failed to find this signing officer info' }
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
      postSet: function(_, n) {
        if ( n ) this.clearAllOwnerAndPercentData();
      },
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          1, 2, 3, 4
        ],
        isHorizontal: true
      },
      validationPredicates: [
        {
          args: ['amountOfOwners'],
          predicateFactory: function(e) {
            return e.AND(
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 1),
              e.LTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .AMOUNT_OF_OWNERS, 4)
            );
          },
          errorMessage: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR'
        }
      ]
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      index: 1,
      documentation: 'First owner',
      validationPredicates: [
        {
          args: ['amountOfOwners', 'owner1', 'owner1$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 1),
              e.HAS(net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER1'])
            )
          },
          errorMessage: 'OWNER_NOT_SELECTED_ERROR'
        },
        {
          args: ['amountOfOwners', 'owner1', 'owner1$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 1),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER1']
              }), true)
            )
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
          args: ['amountOfOwners', 'owner2', 'owner2$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 2),
              e.HAS(net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER2'])
            )
          },
          errorMessage: 'OWNER_NOT_SELECTED_ERROR'
        },
        {
          args: ['amountOfOwners', 'owner2', 'owner2$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 2),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER2']
              }), true)
            )
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
          args: ['amountOfOwners', 'owner3', 'owner3$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 3),
              e.HAS(net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER3'])
            )
          },
          errorMessage: 'OWNER_NOT_SELECTED_ERROR'
        },
        {
          args: ['amountOfOwners', 'owner3', 'owner3$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 3),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER3']
              }), true)
            )
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
          args: ['amountOfOwners', 'owner4', 'owner4$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 4),
              e.HAS(net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER4'])
            )
          },
          errorMessage: 'OWNER_NOT_SELECTED_ERROR'
        },
        {
          args: ['amountOfOwners', 'owner4', 'owner4$errors_'],
          predicateFactory: function(e) {
            return e.OR(
              e.LT(net.nanopay.crunch.onboardingModels.BusinessOwnershipData.AMOUNT_OF_OWNERS, 4),
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.BusinessOwnershipData['OWNER4']
              }), true)
            )
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
      ]
    }
  ],

  reactions: [
    ['', 'propertyChange.amountOfOwners', 'updateTable'],
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
    }
  ],

  methods: [
    {
      name: 'clearAllOwnerAndPercentData',
      code: function() {
        this.chosenOwners = [];
        this.owner1 = this.owner2 = this.owner3 = this.owner4 = undefined;
        this.beneficialOwnersTable.removeAll();
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'OwnerSection',
  extends: 'foam.layout.SectionAxiom',

  messages: [
    { name: 'OWNER_DETAILS', message: 'Details for owner number ' },
  ],

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
        return `${this.OWNER_DETAILS}${index}`;
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

  messages: [
    { name: 'PLEASE_SELECT_ONE', message: 'Please select one of the following...' },
    { name: 'OTHER_MSG', message: 'Add another owner' }
  ],

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
      class: 'String',
      name: 'ownerModel',
      factory: () => 'net.nanopay.model.BeneficialOwner'
    },
    {
      name: 'view',
      value: function(_, X) {
        var ownerCls = this.__context__.lookup(this.ownerModel);
        var dao2 = X.data.slot((soUsersDAO) => soUsersDAO);
        var dao = foam.dao.MDAO.create({
            of: ownerCls
          });

        // note: the one access to businessId(below) ensures the prop is set on obj as it travels through network
        var obj = ownerCls.create({
            business: X.data.businessId,
            id: (this.index * 1000)
          }, X);
        obj.toSummary = () => this.OTHER_MSG;
        dao.put(obj);
        return {
          class: 'net.nanopay.crunch.onboardingModels.SelectionViewOwner',
          ownerModel: this.ownerModel,
          dao2$: dao2,
          dao: dao,
          index: this.index,
          chosenOwners: X.data.chosenOwners,
          choiceView:
          {
            class: 'foam.u2.view.RichChoiceView',
            choosePlaceholder: this.PLEASE_SELECT_ONE,
            sections: ['Owner type']
          }
        };
      }
    },
    {
      name: 'preSet',
      value: function(o, n) {
        if ( ! n ) return n;

        if ( o ) {
          this.chosenOwners.splice(this.chosenOwners.indexOf(o.id), 1, n.id);
        } else {
          this.chosenOwners.push(n.id);
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
      class: 'String',
      name: 'ownerModel',
      factory: () => 'net.nanopay.model.BeneficialOwner'
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
      name: 'choiceData_',
      documentation: 'Data that is set by choiceView(reference object)',
      factory: function() {
        if ( this.chosenOwners[this.index-1] )
          return this.chosenOwners[this.index-1];
      },
      postSet: async function(o, n) {
        // checks if data already exists
        let dataExists = this.data && n === this.data.id;

        try {
          const numSO = (await this.dao2.select(this.COUNT())).value;
          // checks if a signing officer is selected
          // Note: Signing officer id is between 2 and numSO + 1 inclusive while
          // nonsigning officer data has id (its index  * 1000). If n === 1, 'other' is selected
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
    ['', 'propertyChange.choiceData_', 'fromData']
  ],


  listeners: [
    {
      name: 'fromData',
      code: function() {
          this.updateSections_(this.choiceData_);
      }
    }
  ],

  methods: [
    function init() {
      // Pre-initialize with just one section to prevent empty array error
      // thrown by RichChoiceView
      if ( this.chosenOwners[this.index-1] != undefined )
        // set default data if there is
        this.updateSections_(this.chosenOwners[this.index-1]);
      else
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
      var choiceSectionsNonSoFirst = [];

      var ownerCls = this.__context__.lookup(this.ownerModel);

      choiceSections.push({
        // filter out all the siging officers except the one chosen by this owner
        dao: this.dao2.where(
          this.OR(
            this.EQ(ownerCls.ID, choice),
            this.NOT(
              this.IN(ownerCls.ID, this.chosenOwners)
            )
          )
        ),
        hideIfEmpty: true
      });

      choiceSections.push({
        dao$: this.dao$
      });

      choiceSectionsNonSoFirst.push({
        dao$: this.dao$
      });
      choiceSectionsNonSoFirst.push({
        // filter out all the siging officers except the one chosen by this owner
        dao: this.dao2.where(
          this.OR(
            this.EQ(ownerCls.ID, choice),
            this.NOT(
              this.IN(ownerCls.ID, this.chosenOwners)
            )
          )
        ),
        hideIfEmpty: true
      });

      this.choiceSections_ = choice < 1000 && choice != -1 ? choiceSections : choiceSectionsNonSoFirst;
    }
  ]
});
