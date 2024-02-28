foam.CLASS({
  name: 'MementoController',
  extends: 'foam.u2.Controller',

  methods: [
    function render() {
      var self = this;

      this.br()
        .start('h1').add(this.cls_.name).end()
        .br()
        .add('str: ', this.memento_.str$)
        .br()
        .add('tailStr: ', this.memento_.tailStr$)
        .br()
        .add('usedStr: ', this.memento_.usedStr$)
        .br()
        .add('encoding: ', this.memento_.usedStr$.map(s => JSON.stringify(self.memento_.encode())))
        .br()
        .add('tail: ', this.memento_.usedStr$.map(s => JSON.stringify(self.memento_.tail && self.memento_.tail.encode())))
        .br();
    }
  ]
});


foam.CLASS({
  name: 'Menu',
  extends: 'MementoController',

  mixins: [ 'foam.u2.memento.Memorable' ],

  requires: [ 'foam.u2.stack.Stack' ],

  exports: [ 'stack' ],

  properties: [
    {
      name: 'route',
      memorable: true
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.add('Route: ', this.ROUTE);
      this.add(this.slot(route => Controller.create({daoKey: route}, this)));
    }
  ]
});


foam.CLASS({
  name: 'Controller',
  extends: 'MementoController',

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
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'browse', 'edit' ] },
      memorable: true
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.add('Route: ', this.ROUTE);
      this.add(this.route$.map((mode) => { return ( mode == 'browse' ) ? Table.create({}, this) : Detail.create({}, this);}));
    }
  ]
});


foam.CLASS({
  name: 'Table',
  extends: 'MementoController',

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
      this.SUPER();
      this.add('Skip: ',    this.SKIP);
      this.add('Columns: ', this.COLUMNS);
      this.add('Query: ',   this.QUERY);
    }
  ]
});


foam.CLASS({
  name: 'Detail',
  extends: 'MementoController',

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
      this.SUPER();
      this.add('Route/ID: ', this.ROUTE);
    }
  ]
});


foam.CLASS({
  name: 'MementoTest',
  extends: 'MementoController',

  exports: [ 'window' ],

  mixins: [
    'foam.u2.memento.Memorable'
  ],

  properties: [
    {
      name: 'window',
      factory: function() { return window; }
    },
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
    }
  ],

  methods: [
    function render() {
      this.memento_.str = 'menu1/browse/123?q=foobar';

      // this.subMemento.str = 'q=something';
      this.startContext({data: this.memento_}).add(this.memento_.STR).endContext();

      this.SUPER();
      this.tag(Menu);
    }
  ]
});
