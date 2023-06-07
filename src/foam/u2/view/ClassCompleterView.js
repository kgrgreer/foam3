/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ClassCompleterView',
  extends: 'foam.u2.view.SuggestedTextField',
  documentation: `
    View for adding class paths as Strings
    TODO: Maybe add Axiom support
  `,

  classes: [
    {
      name: 'ClassHolder',
      properties: [ 'id', 'cls' ],
      methods: [ function toSummary() { return this.id; } ]
    }
  ],
  properties: [
    {
      name: 'clsDAO',
      factory: function() {
        let a = foam.dao.ArrayDAO.create({ of: this.ClassHolder }, this);
        Object.keys(foam.USED).map(v => { a.put(this.ClassHolder.create({ id: v, cls: foam.USED[v] })); })
        return a;
      }
    },
    {
      name: 'autocompleter',
      factory: function() {
        return this.Autocompleter.create({ dao: this.clsDAO });
      }
    },
    {
      name: 'placeholder',
      value: 'Enter Class Name'
    }
  ]
});
