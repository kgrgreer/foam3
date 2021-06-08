/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'UCJApprovable',
  extends: 'foam.nanos.approval.Approvable',

  implements: [
    'foam.nanos.approval.CustomViewReferenceApprovable'
  ],

  documentation: `
    UCJApprovable is used when we want to view a UCJ in an Approval Request's
    'View Reference'. UCJApprovable stores an EasyCrunchWizard configuration
    that's used to to customize UCJView's behaviour.
  `,

  requires: [
    'foam.u2.crunch.EasyCrunchWizard'
  ],

  javaImports: [
    'foam.u2.crunch.EasyCrunchWizard'
  ],

  properties: [
    {
      name: 'lookupId',
      documentation:`
        In terms of lookup, UCJApprovable is able to default to ucj. id here since lookupId isn't even used here to query the 
        approvable in this case. In the generic Approvable case, the lookupId would be a string consisting of the daoKey, objId 
        and propertiesToUpdate hash so that the system can detect duplicate requests.
      `,
      expression: function(ucj) {
        return ucj.id;
      }
    },
    {
      name: 'blockFulfillementLogic',
      value: true
    },
    {
      name: 'ucj',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.UserCapabilityJunction',
      final: true
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      factory: function() {
        return this.EasyCrunchWizard.create();
      },
      javaFactory: `
        return new EasyCrunchWizard();
      `
    }
  ],

  methods: [
    {
      name: 'launchViewReference',
      code: function(x, approval) {
        this.config.approval = approval;
        x.stack.push({
          class: this.config.view,
          data: this.ucj,
          config: this.config
        });
      }
    },
    {
      name: 'toSummary',
      code: function() {
        return this.ucj.id;
      }
    }
  ]
});
