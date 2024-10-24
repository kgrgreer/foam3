/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.map2d',
  name: 'PredeterminedGridPlacementPlan',
  implements: ['foam.u2.svg.map2d.GridPlacementPlan'],

  documentation: `
    This is a convenient GridPlacementPlan for predetermined cell placements.
  `,

  properties: [
    {
      name: 'coords',
      class: 'Map'
    },
    {
      name: 'shape',
      class: 'Array'
    }
  ],

  methods: [
    {
      name: 'getPlacement',
      code: function getPlacement(id) {
        return this.coords[id] || null;
      }
    },
    function addAssociation_(id, coords, cellSize = [1,1]) {
      this.coords[id] = coords;

      for ( let i = 0 ; i < coords.length ; i++ ) {
        this.shape[i] = Math.max(coords[i] + cellSize[i], this.shape[i]);
      }
    }
  ]
});
