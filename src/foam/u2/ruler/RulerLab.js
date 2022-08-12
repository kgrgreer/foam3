/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.ruler',
  name: 'RulerLab',
  extends: 'foam.u2.Controller',
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'nSpecDAO',
    'ruleDAO',
  ],

  requires: [
    'foam.nanos.boot.NSpec',
    'foam.nanos.ruler.Rule',
    'foam.nanos.ruler.Ruled',
    'foam.u2.DAOList'
  ],

  css: `
    ^ {
      padding: 32px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'daoDAO',
      expression: function (nSpecDAO) {
        return nSpecDAO.where(this.ENDS_WITH(this.NSpec.ID, 'DAO'));
      }
    },
    {
      class: 'Reference',
      name: 'daoKey',
      of: 'foam.nanos.boot.NSpec',
      view: function (_, X) {
        const self = X.data;
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          allowClearingSelection: true,
          rowView: { class: 'foam.u2.view.RichChoiceSummaryIdRowView' },
          sections: [
            {
              heading: 'DAOs',
              dao: self.daoDAO
            }
          ]
        };
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'daoKeyRuleDAO',
      expression: function (ruleDAO, daoKey) {
        return ruleDAO.where(this.EQ(this.Rule.DAO_KEY, daoKey))
          .orderBy(this.DESC(this.Ruled.PRIORITY));
      }
    }
  ],

  methods: [
    function render () {
      console.log('RulerLab', this);
      this
        .addClass()
        .tag(this.DAO_KEY.__, { data: this })
        .tag(this.DAOList, {
          data$: this.daoKeyRuleDAO$,
          rowView: {
            class: 'foam.u2.ruler.RuleView'
          }
        })
    }
  ]
});