/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'Menu',
  extends: 'foam.u2.Controller',

  mixins: [
    'foam.u2.memento.Memorable'
  ],

  properties: [
    {
      name: 'route',
      memorable: true
    }
  ],

  methods: [
    function render() {
      this.br();
      this.start('h1').add("MENU").end();
      this.br();
      this.add('version: ', this.memento_.version$);
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('Menu/Route: ', this.ROUTE);
      this.add(this.slot(route => Controller.create({daoKey: route}, this)));
    }
  ]
});


foam.CLASS({
  name: 'Controller',
  extends: 'foam.u2.Controller',

  mixins: [
    'foam.u2.memento.Memorable'
  ],

  properties: [
    {
      name: 'daoKey'
    },
    {
      name: 'route',
      value: 'edit',
      memorable: true
    }
  ],

  methods: [
    function render() {
      this.br();
      this.start('h1').add("CONTROLLER: ", this.daoKey).end();
      this.br();
      this.add('version: ', this.memento_.version$);
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('Mode/Route: ', this.ROUTE);
      this.add(this.route$.map((mode) => { return ( mode == 'browse' ) ? Table.create({}, this) : Detail.create({}, this);}));
    }
  ]
});


foam.CLASS({
  name: 'Table',
  extends: 'foam.u2.Controller',

  mixins: [
    'foam.u2.memento.Memorable'
  ],

  properties: [
    {
      class: 'Int',
      name: 'skip',
      shortName: 's',
      value: 10,
      memorable: true
    },
    {
      //class: 'StringArray',
      class: 'String',
      name: 'columns',
      memorable: true,
      sticky: true
    },
    {
      name: 'query',
      shortName: 'q',
      memorable: true
    }
  ],

  methods: [
    function render() {
      this.br();
      this.start('h1').add("TABLE").end();
      this.br();
      this.add('version: ', this.memento_.version$);
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('Skip: ',    this.SKIP);
      this.add('Columns: ', this.COLUMNS);
      this.add('Query: ',   this.QUERY);
    }
  ]
});


foam.CLASS({
  name: 'Detail',
  extends: 'foam.u2.Controller',

  mixins: [
    'foam.u2.memento.Memorable'
  ],

  properties: [
    {
      class: 'Int',
      name: 'route',
      memorable: true
    }
  ],

  methods: [
    function render() {
      this.br();
      this.start('h1').add("DETAIL").end();
      this.br();
      this.add('version: ', this.memento_.version$);
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('ID: ',    this.ROUTE);
    }
  ]
});


foam.CLASS({
  name: 'MementoTest',
  extends: 'foam.u2.Controller',

  mixins: [
    'foam.u2.memento.Memorable'
  ],

  properties: [
    {
      name: 'skip',
      shortName: 's',
      value: 10,
      memorable: true
    },
    {
      // class: 'StringArray',
      class: 'String',
      name: 'columns',
      memorable: true,
      sticky: true
    },
    {
      name: 'query',
      shortName: 'q',
      memorable: true
    },
    {
      name: 'abc'
    },
    {
      class: 'FObjectProperty',
      name: 'menu',
      of: 'Menu',
      factory: function() { return Menu.create({}, this); }
    }
  ],

  methods: [
    function render() {
//      this.memento_.str = 'menu1/browse/123?q=foobar';

this.memento_.str = 'menu1/browse?s=11&columns=&q=foobar&s=11&columns=a,b,c&q=question';
      // this.subMemento.str = 'q=something';
      this.startContext({data: this.memento_}).add(this.memento_.STR).endContext();
      this.br().br();
      this.add('version: ', this.memento_.version$);
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.br();
      this.add('skip: ', this.SKIP);
      this.br();
      this.add('query: ', this.QUERY);
      this.br();
      this.add(this.menu);
    }
  ]
});
