/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.graph.map2d',
  name: 'ScaleNodeSecondaryRelationshipStrategy',
  documentation: `
    A SecondaryRelationshipStrategy that scales nodes based on their secondary 
    relationship and positions them accordingly on the graph
  `,

  properties: [
    {
      name: 'nodeQueue'
    },
    {
      name: 'addFunction'
    },
    {
      name: 'xScalePerSecondary',
    },
    {
      name: 'yScalePerSecondary',
    },
  ],

  methods: [
    {
      name: 'getAddNodeFunction',
      code: function getAddNodeFunction() {
        // TODO: add logging or figure out what to do when nodeQueue and addFunction aren't set
        var maybeAddMore = () => {
          if ( this.nodeQueue.length < 1 ) return;

          let next = this.nodeQueue.shift();
          
          var row = next.parent.row.position + 1;
          var col = next.parent.col.position + next.index;

          if ( next.parent.obj.secondaryForwardLinks ){
            var rowAdj = next.parent.obj.secondaryForwardLinks.length * this.yScalePerSecondary;
            var colAdj = next.parent.obj.secondaryForwardLinks.length * this.xScalePerSecondary;

            row += rowAdj;
            col += colAdj;
          }

          return this.addFunction(
            next.obj,
            row,
            col,
            next.index != 0
          ).then(maybeAddMore);
        }

        return maybeAddMore;
      }
    },
    {
      name: 'getBaseCellSize',
      code: function getBaseCellSize(obj) {
        if ( obj.secondaryForwardLinks === undefined ) {
          console.warn("obj.secondaryForwardLinks.length is undefined");
          console.warn('obj', obj);
          return [1, 1];
        }

        var xScale = 1 + (obj.secondaryForwardLinks.length * this.xScalePerSecondary);
        var yScale = 1 + (obj.secondaryForwardLinks.length * this.yScalePerSecondary);

        return [ 1 * xScale, 1 * yScale ];
      }
    }
  ]
});
