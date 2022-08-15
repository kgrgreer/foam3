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
    'ruleGroupDAO',
  ],

  exports: [
    'openInSideView'
  ],

  requires: [
    'foam.nanos.boot.NSpec',
    'foam.nanos.ruler.Rule',
    'foam.nanos.ruler.Ruled',
    'foam.nanos.ruler.RuleGroup',
    'foam.u2.DAOList',
    'foam.u2.borders.SideViewBorder',
    'foam.u2.ruler.ExprComparator',
    'foam.u2.ruler.ReferenceExpr',
    'foam.mlang.If',
    'foam.mlang.Constant',
  ],

  css: `
    ^ {
      padding: 32px;
    }
    ^list {
      display: flex;
      flex-direction: column;
      gap: 2.4rem;
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
    },
    {
      class: 'StringArray',
      name: 'applicableRuleGroups'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'daoKeyRuleGroupDAO',
      expression: function (ruleGroupDAO, applicableRuleGroups) {
        return ruleGroupDAO.where(this.IN(
          this.RuleGroup.ID,
          applicableRuleGroups
        ));
      }
    },
    { class: 'Boolean', name: 'sideVisible' },
    { class: 'foam.u2.ViewSpec', name: 'sideView' }
  ],

  methods: [
    function render () {
      this.onDetach(this.daoKeyRuleDAO$.sub(async () => {
        this.updateGroupList(this.daoKeyRuleDAO$.get());
      }));
      this.updateGroupList(this.daoKeyRuleDAO$.get());
      this
        .addClass()
        .start(this.SideViewBorder, {
          sideVisible$: this.sideVisible$,
          sideView$: this.sideView$
        })
          .tag(this.DAO_KEY.__, { data: this })
          .start(this.DAOList, {
            data$: this.daoKeyRuleGroupDAO$,
            rowView: {
              class: 'foam.u2.ruler.RulerLabGroupView',
              dao$: this.daoKeyRuleDAO$
            }
          })
            .addClass(this.myClass('list'))
          .end()
        .end()
    }
  ],

  listeners: [
    async function updateGroupList (ruleDAO) {
      const groups = {};
      const rules = (await ruleDAO.select()).array;
      for ( const rule of rules ) {
        groups[rule.ruleGroup] = true;
      }
      this.applicableRuleGroups = Object.keys(groups);
    },
    function openInSideView (obj) {
      this.sideView = {
        class: 'foam.u2.detail.TabbedDetailView',
        data: obj
      };
      this.sideVisible = true;
    }
  ]
});