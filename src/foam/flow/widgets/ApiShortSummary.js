/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'ApiShortSummary',
  extends: 'foam.flow.widgets.AxiomShortSummary',
  documentation: `
    Brief summary of properties for overview documentation.
  `,

  properties: [
    {
      name: 'axiomClass',
      value: 'foam.core.Property'
    }
  ],

  methods: [
    function generateAxiomClassHeadings(el) {
      el.start('th').add('Type').end()
        .start('th').add('Usage').end()
        .start('th').add('Default').end();//value property
    },
    function generateAxiomClassFields(el, p) {
      el.start('td').add(this.toFriendlyType(p)).end()
        .start('td').add(this.toFriendlyUsage(p)).end()
        .start('td').add(this.toFriendlyValue(p)).end();
    },
    function toFriendlyUsage(p) {
      return p.required ? 'Required' : 'Optional';
    },
    function toFriendlyValue(p) {
      return p.value ? p.value : '';
    },
    function toFriendlyType(p) {
      var propCls = p.cls_.id;
      const prefix = 'foam.core.';
      if ( propCls.startsWith(prefix) ) {
        propCls = propCls.slice(prefix.length);
      }
      if ( propCls == 'FObjectProperty' ) {
        return 'FObject of ' + p.of.id;
      }
      if ( propCls == 'FObjectArray' ) {
        return 'FObject[] of ' + p.of.id;
      }
      if ( propCls == 'Enum' ) {
        return 'Enum of ' + p.of.id;
      }
      if ( propCls == 'foam.dao.DaoSpec' ) {
        return 'DAO of ' + p.of.id;
      }
      return propCls;
    }
  ],
});
