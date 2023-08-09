/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomTableView',
  extends: 'foam.u2.view.UnstyledTableView',

  css: `
    ^ {
      border-collapse: collapse;
      width: 100%;
    }
    ^ th {
      text-align: left;
      padding: 8px 3px 3px 7px;
    }
    ^ td {
      vertical-align: top;
      padding: 8px 3px 3px 7px;
    }
    ^documentation {
      margin: 3px 10px 2px 0px;
    }
  `,

  properties: [
    {
      name: 'editColumnsEnabled',
      value: false
    },
    {
      name: 'disableUserSelection',
      value: true
    }
  ],

  methods: [
    function render() {
      this.addClass(this.myClass());
      /** Temporary implementation while CSS is broken for UnstyledTableView. Remove when fixed. **/
      this.start('table').
        start('tr').start('th').attrs({width: '250px'}).add('Class').end().start('th').add('Name').end().start('th').add('Description').end().end().
        select(this.data, function(a) {
          return this.E().start('tr').start('td').add(a.cls_.name).end().start('td').add(a.name).end().start('td').style({overflow: 'hidden', 'text-wrap':'nowrap'}).add(a.documentation).end().end();
        }).
      end();
    }
  ]
});
