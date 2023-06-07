/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'ControlBorder',
  extends: 'foam.u2.Element',

  documentation: `
    This border exports itself as controlBorder so that views underneath
    can release control of how their actions are displayed.
  `,

  requires: [
    'foam.u2.ActionReference'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'actionRules'
    }
  ],

  classes: [
    {
      name: 'ActionRule',

      properties: [
        'prop',
        {
          class: 'Boolean',
          name: 'append'
        },
        {
          class: 'foam.mlang.predicate.PredicateProperty',
          name: 'predicate'
        }
      ],
    }
  ],

  methods: [
    // Fluent methods to configure actions
    function setActionProp (predicate, prop) {
      this.actionRules.push(this.ActionRule.create({ predicate, prop }));
      return this;
    },
    function setActionList (predicate, prop) {
      this.actionRules.push(this.ActionRule.create({
        predicate, prop,
        append: true
      }));
      return this;
    },

    // Methods for action providers
    function addAction (action, data) {
      for ( const rule of this.actionRules ) {
        if ( ! rule.predicate.f(action) ) continue;

        const actionRef = this.ActionReference.create({ action, data });

        if ( rule.append ) {
          const arry = this[rule.prop];
          const i = arry.findIndex(ar => ar.action.name == action.name);
          if ( i < 0 ) {
            this[rule.prop].push(actionRef);
          } else {
            this[rule.prop][i] = actionRef;
          }
          this[rule.prop] = [...this[rule.prop]];
        } else {
          this[rule.prop] = actionRef;
        }

        return true;
      }
    
      return false;
    },

    function clearActions () {
      for ( const rule of this.actionRules ) {
        this.clearProperty(rule.prop);
      }
    }
  ]
});
