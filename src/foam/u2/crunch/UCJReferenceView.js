/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'UCJReferenceView',
  extends: 'foam.u2.View',
  documentation: `
    Render the UCJ specified by 'data' in an inline CRUNCH wizard. The default
    WAO setting is APPROVAL, which means UCJ changes will generate approvals
    instead of updating UCJs directly.
  `,

  imports: [
    'crunchController',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.nanos.crunch.ui.UCJView',
    'foam.u2.crunch.wizardflow.ApprovalRequestAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  css: `
    ^ .foam-u2-stack-StackView {
      padding-left: 0px !important;
    }
  `,

  properties: [
    {
      name: 'localStack',
      factory: function () {
        return this.Stack.create();
      }
    },
    {
      name: 'ucj',
      transient: true
    }
  ],

  methods: [
    async function initE() {
      this
        .add(this.slot(function (ucj) {
          if ( ! ucj ) return this.E();
          return this.UCJView.create({
            data: ucj,
            mode: this.mode
          });
        }))

      this.ucj = (
        await this.userCapabilityJunctionDAO.where(this.data).select()
      ).array[0];
    }
  ]
});
