/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * TODO:
 * - Add grouping/ordering support
 * - Add onClick support
 * - Add Projection support
 */
foam.CLASS({
  package: 'foam.u2',
  name: 'DAOList',
  extends: 'foam.u2.View',

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

  requires: ['foam.u2.view.LazyScrollManager'],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView',
      value: { class: 'foam.u2.CitationView' }
    },
    'selection',
    'hoverSelection',
    'listEl_'
  ],

  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .start('', {}, this.listEl_$)
          .tag(this.LazyScrollManager, {
              data$: this.data$,
              rowView: this.rowView,
              rootElement: this.listEl_,
              ctx: this
          }, this.scrollEl_$)
        .end();
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
