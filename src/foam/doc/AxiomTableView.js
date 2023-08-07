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
    ^ thead {
      background-color: #dee3e9;
    }
    ^ th {
      text-align: left;
      padding: 8px 3px 3px 7px;
    }
    ^ tbody > tr:nth-child(odd) {
      background-color: #f6f9f9;
    }
    ^ tbody > tr:nth-child(even) {
      background-color: $white;
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
      /** Temporary implementation while CSS is broken for UnstyledTableView. Remove when fixed. **/
      this.start('table').
        start('tr').start('td').attrs({width: '250px'}).add('Class').end().start('td').add('Name').end().end().
        select(this.data, function(a) {
          return this.E().start('tr').start('td').add(a.cls_.name).end().start('td').add(a.name).end().end();
        }).
      end();
    }
  ]
});
