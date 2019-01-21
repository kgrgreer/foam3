foam.CLASS({
    package: 'net.nanopay.tx.ui',
    name: 'DAOCreateControllerView',
    extends: 'foam.u2.View',
  
    requires: [
      'foam.comics.DAOCreateController'
    ],
  
    imports: [
      'dao',
      'stack'
    ],
  
    exports: [
      'data'
    ],
  
    properties: [
      {
        class: 'FObjectProperty',
        of: 'foam.comics.DAOCreateController',
        name: 'data',
        factory: function() {
          return this.DAOCreateController.create({ dao: this.dao });
        }
      },
      {
        class: 'String',
        name: 'title',
        expression: function(data$dao$of) {
          return 'Create ' + data$dao$of.name;
        }
      },
      {
        class: 'String',
        name: 'detailView'
      }
    ],
  
    reactions: [
      [ 'data', 'finished', 'onFinished' ]
    ],
  
    methods: [
      function initE() {
        this.
        addClass(this.myClass()).
        start('table').addClass('createControllerTable').
          start('tr').
            start('td').style({'vertical-align': 'top', 'width': '100%'}).
              start('span').
                style({background: 'rgba(0,0,0,0)'}).
                show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
              end().
              tag({class: this.detailView}, {data$: this.data$.dot('data'), fromCreateButton: true }).
              start().
                  style({'padding-bottom': '4px'}).
                  add(this.data.cls_.getAxiomsByClass(foam.core.Action)).
                end().
            end().
          end().
        end();
      }
    ],
  
    listeners: [
      function onFinished() {
        this.stack.back();
      }
    ]
  });