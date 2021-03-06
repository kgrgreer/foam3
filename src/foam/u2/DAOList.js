/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'DAOList',
  extends: 'foam.u2.Element',

  topics: [ 'rowClick' ],

  exports: [
    'selection',
    'hoverSelection',
    'data as dao'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView'
    },
    {
      // deprecated
      class: 'foam.u2.ViewFactory',
      name: 'rowFactory'
    },
    'selection',
    'hoverSelection'
  ],

  methods: [
    function render() {
      var view = this;
      this.
        addClass(this.myClass()).
        select(this.data$proxy, function(obj) {
          return ( this.rowView ?
            foam.u2.ViewSpec.createView(this.rowView, { data: obj }, this, this.__subSubContext__) :
            this.rowFactory$f({data: obj})).
              on('mouseover', function() { view.hoverSelection = obj; }).
              on('click', function() {
                view.selection = obj;
                if ( view.importSelection$ ) view.importSelection = obj;
                if ( view.editRecord$ ) view.editRecord(obj);
                view.rowClick.pub(obj)
              }).
              addClass(this.slot(function(selection) {
                if ( obj === selection ) return view.myClass('selected');
                  return '';
              }, view.selection$));
        });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'RelationshipDAOToERefinement',
  refines: 'foam.dao.RelationshipDAO',
  flags: ['web'],

  requires: [
    'foam.u2.CitationView',
    'foam.u2.DAOList'
  ],

  methods: [
    function toE(args, ctx) {
      args = args || {};
      args.data = this;
      args.rowView = this.CitationView;
      return this.DAOList.create(args, ctx);
    }
  ]
});
