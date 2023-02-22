/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.ruler',
  name: 'RulerLabGroupView',
  extends: 'foam.u2.View',

  css: `
    ^heading {
      height: 2.4rem;
      font-size: 1.6rem;
      background-color: rgb(47, 61, 143);
      padding: 0 0.8rem;
      color: #FFF;
      font-weight: 600;
    }

    ^border {
      border: 0.2rem solid rgb(47, 61, 143);
      padding: 0.8rem;
    }
  
    ^list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
  `,

  requires: [
    'foam.nanos.ruler.Rule',
    'foam.u2.DAOList',
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'groupFilterRuleDAO',
      expression: function (dao, data) {
        return dao.where(this.EQ(this.Rule.RULE_GROUP, this.data));
      }
    }
  ],

  methods: [
    function render () {
      this
        .addClass()
        .start()
          .addClass(this.myClass('heading'))
          .add(this.data$.dot('id'))
        .end()
        .start()
          .addClass(this.myClass('border'))
          .start(this.DAOList, {
            data$: this.groupFilterRuleDAO$,
            rowView: {
              class: 'foam.u2.ruler.RuleView'
            }
          })
            .addClass(this.myClass('list'))
          .end()
        .end()
    }
  ]
});
