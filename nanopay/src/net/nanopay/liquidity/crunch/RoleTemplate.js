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
  package: 'net.nanopay.liquidity.crunch',
  name: 'RoleTemplate',
  implements: [
    'foam.core.Validatable'
  ],

  // TODO: sections

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'name',
      required: true,
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'viewAccount',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'makeAccount',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'approveAccount',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'viewTransaction',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'makeTransaction',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'approveTransaction',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'viewRule',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'makeRule',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'approveRule',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'viewUser',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'makeUser',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'approveUser',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'viewLiquiditySettings',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'makeLiquiditySettings',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'approveLiquiditySettings',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'viewRoleAssignment',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'makeRoleAssignment',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'approveRoleAssignment',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'viewDashboard',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() )
          return 'At least one permission must be selected.'
      }
    },
    {
      class: 'Boolean',
      name: 'ingestFile',
      readPermissionRequired: true,
      writePermissionRequired: true,
      validateObj: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction, viewRule, makeRule, approveRule, viewUser, makeUser, approveUser, viewLiquiditySettings, makeLiquiditySettings, approveLiquiditySettings, viewRoleAssignment, makeRoleAssignment, approveRoleAssignment, ingestFile, viewDashboard) {
        if ( ! this.validate() ) {
          return 'At least one permission must be selected.'
        }
      }
    },
    {
      class: 'Boolean',
      name: 'isAccountGroupRequired',
      documentation: `
        Hidden property on RoleTemplate model used to detect if assigning this role template will need an account group based on having V/M/A account and/or V/M/A transaction
      `,
      visibility: 'HIDDEN',
      expression: function(viewAccount, makeAccount, approveAccount, viewTransaction, makeTransaction, approveTransaction) {
        return viewAccount || makeAccount || approveAccount || viewTransaction || makeTransaction || approveTransaction;
      }
    },
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function(x) {
        return this.name || this.id;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getName()) ? getId() : getName();
      `
    },
    {
      name: 'getImpliedCapabilityNames',
      type: 'List',
      javaCode: `
        List<PropertyInfo> allProps = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        List<String> impliedCapabilityNames = new ArrayList<>();

        for ( PropertyInfo property : allProps ){
          if ( ! property.getValueClass().equals(Boolean.class) ) continue;

          Boolean isCurrentCapabilityIncluded = (Boolean) getProperty(property.getName());

          if ( isCurrentCapabilityIncluded ){
            impliedCapabilityNames.add(property.getName());
          }
        }

        return impliedCapabilityNames;
      `
    },
    {
      name: 'validate',
      javaCode: `
        if ( ! 
              ( 
                getViewAccount() || getApproveAccount() || getMakeAccount() ||
                getViewTransaction() || getApproveTransaction() || getMakeTransaction() ||
                getViewRule() || getApproveRule() || getMakeRule() ||
                getViewUser() || getApproveUser() || getMakeUser() ||
                getViewLiquiditySettings() || getApproveLiquiditySettings() || getMakeLiquiditySettings() ||
                getViewRoleAssignment() || getMakeRoleAssignment() || getApproveRoleAssignment() ||
                getIngestFile() || getViewDashboard()
              ) 
            )
          throw new IllegalStateException("At least one permission must be selected in order to create this capability.");
      `,
      code: function() {
        return this.viewAccount || this.approveAccount || this.makeAccount ||
              this.viewTransaction || this.approveTransaction || this.makeTransaction ||
              this.viewRule || this.approveRule || this.makeRule ||
              this.viewUser || this.approveUser || this.makeUser ||
              this.viewLiquiditySettings || this.approveLiquiditySettings || this.makeLiquiditySettings ||
              this.viewRoleAssignment || this.makeRoleAssignment || this.approveRoleAssignment ||
              this.ingestFile || this.viewDashboard;
      }
    }
  ]
});
