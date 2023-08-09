/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'PackageList',
  extends: 'foam.u2.View',

  css: `
  ^selected { background: pink; }

  ^row:hover { border: 1px solid red; }
  `,

  properties: [
    'hardSelection',
    'packages'
  ],

  methods: [
    function render() {
      var self = this;
      this.start('h3').add('Package:').end();
      var a = Object.keys(this.packages);
      a.sort();
      this.forEach(a, p => {
        this.start().
          addClass(self.myClass('row')).
          enableClass(self.myClass('selected'), self.data$.map(d => d === p)).
          on('click',     () => self.hardSelection = self.data = p).
          on('mouseover', () => self.data = p).
          on('mouseout',  () => self.data = self.hardSelection).
          add(p).start().style({float: 'right', 'padding-left': '8px'}).add(this.packages[p].length).end().
        end();
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ModelList',
  extends: 'foam.u2.View',

  css: `
    ^selected {
      background: pink;
    }

    ^row:hover {
      background: lightgray;
    }
  `,

  properties: [
    { name: 'package', value: [], preSet: function(o, n) { return n.sort((a, b) => foam.String.compare(a.id, b.id)); } }
  ],

  methods: [
    function render() {
      var self = this;

      this.start('h3').add('Model:').end().
      start().
      add(this.dynamic(function(package) {
        this.forEach(package, m =>
          this.start().
            addClass(this.myClass('row')).
            enableClass(this.myClass('selected'), self.data$.map(d => d === m)).
            on('click', () => self.data = m).
            add(m.id /*, m.documentation*/).
          end()
        );
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.doc',
  name: 'ModelBrowser',
  extends: 'foam.u2.Element',
  documentation: 'Show UML & properties for passed in models',

  requires: [
    'foam.core.Model',
    'foam.dao.ArrayDAO',
    'foam.dao.PromisedDAO',
    'foam.doc.ClassList',
    'foam.doc.DocBorder',
    'foam.doc.ModelList',
    'foam.doc.PackageList',
    'foam.doc.SimpleClassView',
    'foam.doc.UMLDiagram',
    'foam.nanos.boot.NSpec'
  ],

  imports: [ 'nSpecDAO', 'params' ],

  exports: [ 'conventionalUML', 'path as browserPath' ],

  css: `
    ^ {
      display: flow-root;
      height: auto;
      width: 700px;
      margin: 20px;
    }
    ^ .foam-doc-UMLDiagram{
      width: 700px;
      margin: 0;
      margin-bottom: 20px;
    }
    ^ .foam-doc-UMLDiagram canvas{
      width: 700px;
    }
    ^ .foam-u2-ActionView-printPage{
      margin-top: 20px;
    }
    @media print{
      ^ .foam-u2-ActionView-printPage{
        display: none;
      }
      .foam-nanos-u2-navigation-TopNavigation{
        display: none;
      }
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'path',
      width: 80,
      factory: function() {
        return this.params.path || 'foam.core.Property';
      }
    },
    {
      name: 'packages',
      value: []
    },
    {
//      class: 'String',
      name: 'package',
      value: 'foam.core'
    },
    {
//      class: 'String',
      name: 'model',
      value: 'foam.core.Model'
    },
    [ 'conventionalUML', true ],
    {
      class: 'Map',
      name: 'allowedModels',
      adapt: function(_, models) {
        if ( foam.Array.isInstance(models) ) {
          var map = {};
          models.forEach((m) => map[m.id] = true);
        }
        return models;
      }
    },
    {
      name: 'modelDAO',
      factory: function(/*nSpecDAO, allowedModels*/) {
        var self = this;
        var dao  = self.ArrayDAO.create({of: self.Model}).orderBy(foam.core.Model.ID);
        var all = [];
        var packages = { '--All--': all};
        function addModel(m) {
          try {
          var c = foam.lookup(m);
          if ( c ) {
            var mdl = c.model_;
            (packages[mdl.package] || ( packages[mdl.package] = [])).push(mdl);
            all.push(mdl);
            dao.put(mdl);
          }
        } catch (x) {}
        }
        Object.keys(foam.USED).forEach(addModel);
        Object.keys(foam.UNUSED).forEach(addModel);
        this.packages = packages;
        return dao;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;

      globalThis.browser = this;

      this.modelDAO;
      this.start('table').
        attrs({cellpadding: 20}).
        start('tr').
          start('td').style({'vertical-align': 'top'}).
            add(this.PackageList.create({data$: this.package$, packages: this.packages})).
          end().
          start('td').style({'vertical-align': 'top'}).
            add(this.ModelList.create(  {data$: this.model$,   package$: this.package$.map(p => this.packages[p])})).
          end().
          start('td').style({'vertical-align': 'top'}).
            add(this.dynamic(function (model) {
              model = foam.maybeLookup(model.id);
              if ( ! model ) return;
              this.
              start('h3').style({'padding-left': '16px'}).add(model.id).end().
              start(self.UMLDiagram,      {data: model}).end().
              start(self.SimpleClassView, {data: model}).style({'padding-left': '18px'}).end();
            })).
          end().
        end().
      end();
    }
  ],

  actions: [
    {
      name: 'printPage',
      label: 'Print',
      code: function() { globalThis.print(); }
    }
  ]
});
