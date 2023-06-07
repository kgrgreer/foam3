/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
    [ 'conventionalUML', false ],
    {
      class: 'Map',
      name: 'allowedModels',
      adapt: function(_,models) {
        if ( foam.Array.isInstance(models) ) {
          var map = {};
          models.forEach((m) => map[m.id] = true);
        }
        return models;
      }
    },
    {
      name: 'modelDAO',
      expression: function(nSpecDAO,allowedModels) {
        var self = this;
        var dao = self.ArrayDAO.create({of: self.Model});
        Object.keys(foam.USED).forEach(m => {try { dao.put(foam.lookup(m).model_); } catch(x) {}});
//        Object.keys(foam.UNUSED).forEach(m => dao.put(foam.lookup(m).model_));
        return dao;
        /*
        return self.PromisedDAO.create({
          promise: nSpecDAO.select().then(function(a) {
            return Promise.all(
              a.array.map(function(nspec) {
                return self.parseClientModel(nspec)
              }).filter(function(cls) {
                return cls && (allowedModels == undefined || ( Object.keys(allowedModels).length && Object.values(allowedModels).some( e => e == true) ) ? !!allowedModels[cls.id] : true );
              }).map(function(cls) {
                return dao.put(cls.model_);
              })
            );
          }).then(function() {
            return dao;
          })
        })
        */
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;

      this.start().addClass(this.myClass())
        .start('h2').add('Model Browser').end()
        .start().add(this.PRINT_PAGE).end()
        .select(this.modelDAO.limit(10), function(model) {
          try {
          console.log('ModelBrowser:', model.id);
          var cls = foam.maybeLookup(model.id);
          return self.E().
            start().style({ 'font-size': '2rem', 'margin-top': '20px' }).
              add('Model ' + model).
            end().
            start(self.UMLDiagram, { data: cls }).end().
            start(self.SimpleClassView, { data: cls }).end();
          } catch (x) {
            console.log('Error: ', x);
          }
        })
      .end();
    },

    function parseClientModel(n) {
      var cls = JSON.parse(n.client);
      if ( Object.keys(cls).length === 0 ){
        console.log('this model', n.name, 'is not accessible in the client side or is a service')
        //throw new Error('Unsupported');
        return null;
      }
      var clsName = cls.of ? cls.of : cls.class;
      return foam.maybeLookup(clsName);
    }
  ],

  actions: [
    {
      name: 'printPage',
      label: 'Print',
      code: function() {
        globalThis.print();
      }
    }
  ]
});
