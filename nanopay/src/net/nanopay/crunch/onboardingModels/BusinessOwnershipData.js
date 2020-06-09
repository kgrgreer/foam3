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

  sections: [
    {
      name: 'ownershipAmountSection',
      title: 'How many individuals directly or indirectly own 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document
          the percentage of ownership of any individual with a 25% + stake in the company.`,
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
      help: 'Awesome! Just confirm the details you’ve entered are correct and we can proceed!',
      isAvailable: function(amountOfOwners, reviewed) {
        return amountOfOwners > 0 || (amountOfOwners == 0 && reviewed);
      }
    },
  ],

  messages: [
    { name: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR', message: 'Please select a number of owners.' },
    { name: 'INVALID_OWNER_SELECTION_ERROR', message: 'One or more of the owner selection is invalid.' },
    { name: 'OWNER_1_ERROR', message: 'Owner1 is invalid.' },
    { name: 'OWNER_2_ERROR', message: 'Owner2 is invalid.' },
    { name: 'OWNER_3_ERROR', message: 'Owner3 is invalid.' },
    { name: 'OWNER_4_ERROR', message: 'Owner4 is invalid.' },
    { name: 'TOTAL_OWNERSHIP_ERROR', message: 'The total ownership should be less than 100%.' }
  ],

  properties: [
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    {
      name: 'reviewed',
      class: 'Boolean',
      readPermissionRequired: true,
      writePermissionRequired: true
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
        var sinkFn = (so) => {
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
          .then((sos) => {
            this.businessEmployeeDAO
              .where(this.IN(foam.nanos.auth.User.ID, sos.array))
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
      }
    },

    // Ownership Amount Section
    {
      section: 'ownershipAmountSection',
      name: 'amountOfOwners',
      class: 'Int',
      label: '',
      value: -1,
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          0, 1, 2, 3, 4
        ],
        isHorizontal: true
      },
      validationPredicates: [
        {
          args: ['amountOfOwners', 'reviewed'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.GTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                  .AMOUNT_OF_OWNERS, 0),
                e.LTE(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                  .AMOUNT_OF_OWNERS, 4)
              ),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
                .REVIEWED, false)
            );
          },
          errorMessage: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR'
        },
        {
          args: ['ownerSelectionsValidated', 'owner1', 'owner2', 'owner3', 'owner4', 'chosenOwners'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.onboardingModels
              .BusinessOwnershipData.OWNER_SELECTIONS_VALIDATED, true);
          },
          errorMessage: 'INVALID_OWNER_SELECTION_ERROR'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'publiclyTraded',
      section: 'ownershipAmountSection',
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
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner1$errors_', 'reviewed'],
        predicateFactory: function(e) {
          return e.OR(
            e.EQ(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .REVIEWED, false),
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
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner2$errors_', 'reviewed'],
        predicateFactory: function(e) {
          return e.OR(
            e.EQ(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .REVIEWED, false),
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
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner3$errors_', 'reviewed'],
        predicateFactory: function(e) {
          return e.OR(
            e.EQ(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .REVIEWED, false),
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
      validationPredicates: [
      {
        args: ['amountOfOwners', 'owner4$errors_', 'reviewed'],
        predicateFactory: function(e) {
          return e.OR(
            e.EQ(net.nanopay.crunch.onboardingModels.BusinessOwnershipData
              .REVIEWED, false),
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

        if ( getAmountOfOwners() >= 1 ) sum += getOwner1().getOwnershipPercent();
        if ( getAmountOfOwners() >= 2 ) sum += getOwner2().getOwnershipPercent();
        if ( getAmountOfOwners() >= 3 ) sum += getOwner3().getOwnershipPercent();
        if ( getAmountOfOwners() >= 4 ) sum += getOwner4().getOwnershipPercent();

        return sum;
      `,
      visibility: function(totalOwnership) {
        return Number(totalOwnership) > 100 ?
          foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
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
    },
    {
      section: 'reviewOwnersSection',
      name: 'noBeneficialOwners',
      label: 'There are no beneficial owners with 25% or more ownership listed.',
      documentation: 'If amountOfOwners property is zero, this message will be display',
      visibility: function(amountOfOwners) {
        return amountOfOwners === 0 ?
          foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      },
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

        if ( ! this.getReviewed() ) {
          throw new IllegalStateException("Must confirm all data entered has been reviewed and is correct.");
        }
      `,
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
      name: 'help',
      value: 'Next, I’ll need you to tell me some more details about the remaining owners who hold 25% + of the company…'
    },
    {
      name: 'title',
      expression: function(index) {
        return `Add for owner #${index}`;
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
          // note: the one access to businessId(below) ensures the prop is set on obj as it travels through network
        var obj = net.nanopay.model.BeneficialOwner.create({
            business: X.data.businessId,
            id: 1
          }, X);
        obj.toSummary = () => 'Other';
        dao.put(obj);
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: { class: 'foam.u2.detail.VerticalDetailView' },
          writeView: {
            class: 'net.nanopay.crunch.onboardingModels.SelectionViewOwner',
            dao2$: dao2,
            dao: dao,
            choiceView:
            {
              class: 'foam.u2.view.RichChoiceView',
              choosePlaceholder: 'Please select one of the following...',
              sections: [
                {
                  heading: 'Please select one of the following registered Signing Officers...',
                  dao$: dao2
                },
                {
                  heading: 'If owner is not a registered Signing Officers, please select the following...',
                  dao: dao
                }
              ]
            }
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
  requires: [
    'foam.u2.layout.Rows'
  ],
  properties: [
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
      documentation: 'dao that is used in choiceView, should not change.'
    },
    {
      name: 'otherLabel',
      class: 'String'
    },
    {
      name: 'choiceData_',
      documentation: 'Data that is set by choiceView(reference object)',
      postSet: function(_, n) {
          if ( this.data && n == this.data.id ) return n;
          if ( n > 1 ) {
            this.dao2.find(n).then(
              (obj) =>
                this.data = obj ? obj.clone() : obj
            );
          } else {
            this.dao.find(n).then(
              (obj) =>
                this.data = obj ? obj.clone() : obj
            );
          }
      }
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
    function initE() {
      this.add(this.slot((choiceData_) => {
        return this.Rows.create()
          .tag(this.choiceView, { data$: this.choiceData_$ }, this.choiceView_$)
          .start()
            .tag({
              class: 'foam.u2.detail.SectionView',
              sectionName: 'requiredSection',
              showTitle: false
            }, { data$: this.data$ })
          .end();
        }
      ));
    }
  ]
});
