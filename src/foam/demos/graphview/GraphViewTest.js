/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'foam.demos.graphview',
  name: 'GraphViewTest',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.graphview.GraphView',
    'foam.graphics.Box',
    'foam.graphics.Circle'
  ],

  constants: {
    SELECTED_COLOR: '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  properties: [
    /*{
      name: 'canvas',
      factory: function() {
        return this.Box.create({width: 600, height: 500, color: '#f3f3f3'});
      }
    },*/
  ],

  methods: [
    function render() {
      this.SUPER();

      this.add(this.GraphView.create());
    }
  ]
} );
