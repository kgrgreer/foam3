/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'DAGView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.svg.Position',
    'foam.u2.svg.RelativePosition',
    'foam.u2.svg.arrow.VHVArrowLine',
    'foam.u2.svg.arrow.SimpleArrowHead',
    'foam.u2.svg.arrow.StraightArrowLine',
    'foam.u2.svg.arrow.SegmentedArrowLine',
    'foam.u2.svg.graph.ArrowDisplaceCellsPlacementPlan',
    'foam.u2.svg.interactive.Draggable'
  ],

  exports: [
    'graph',
    'svg'
  ],

  classes: [
    {
      name: 'ArrowPlan',
      documentation: 'plan for rendering an arrow',
      properties: [
        { name: 'enterCellLane', class: 'Int' },
        { name: 'exitCellLane', class: 'Int' },
        { name: 'topRowLane', class: 'Int' },
        { name: 'columnLane', class: 'Int' },
        { name: 'bottomRowLane', class: 'Int' }
      ]
    }
  ],

  properties: [
    {
      name: 'graph',
      class: 'FObjectProperty',
      of: 'foam.graph.Graph'
    },
    {
      name: 'selectedNodeId',
      class: 'String',
      documentation:`
        OPTIONAL: Set a value if you want to enable node higlighting.
        If used, ensure that the nodeView has an isSelected property to bind to.
      `
    },
    {
      name: 'nodeView',
      class: 'foam.u2.ViewSpec',
      documentation: `
        ViewSpec for each node rendered in the DAG view. This u2 element should
        render as the same size specified by the cellSize property.
      `
    },
    {
      class: 'Class',
      name: 'nodeViewClass_',
      expression: function (nodeView) {
        if ( typeof nodeView?.create === 'function' ) return nodeView;
        const cls = nodeView.class;
        if ( typeof cls?.create === 'function' ) return cls;
        return foam.lookup(cls);
      }
    },
    {
      name: 'cellSize',
      class: 'Array',
      factory: () => [100, 100]
    },
    {
      name: 'gridGap',
      documentation: `Number of pixels between each item before adjustments`,
      class: 'Int',
      value: 20
    },
    {
      name: 'gridPlacement',
      documentation: `Plan to place objects on a grid before adjustments`,
      class: 'FObjectProperty',
      of: 'foam.u2.svg.map2d.GridPlacementPlan'
    },
    {
      name: 'placement_',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.map2d.PlacementPlan',
      factory: function () {
        return this.ArrowDisplaceCellsPlacementPlan.create({
          gridPlacementPlan$: this.gridPlacement$,
          gridGap$: this.gridGap$,
          cellSize: this.cellSize
        })
      }
    },
    {
      class: 'FObjectProperty',
      name: 'embeddedSecondaryRelationshipStrategy',
      of: 'foam.graph.map2d.ScaleNodeSecondaryRelationshipStrategy'
    },
    {
      class: 'Boolean',
      name: 'isArrowheadShown',
      value: true,
    },
    {
      name: 'zoom',
      class: 'Float'
    },
    {
      name: 'rowLanes_',
      factory: () => ({})
    },
    {
      name: 'colLanes_',
      factory: () => ({})
    },
    {
      name: 'cellLanes_',
      factory: () => ({})
    },
    {
      name: 'arrows_',
      class: 'Array'
    },
    {
      name: 'alreadyRendered_',
      class: 'Map'
    },
    {
      class: 'Map',
      name: 'nodeDraggables_'
    },
    {
      name: 'svg'
    }
  ],

  methods: [
    function render() {
      this.rowLanes_ = {};
      this.colLanes_ = {};
      this.cellLanes_ = {};
      this.arrows_ = [];
      this.alreadyRendered_ = {};

      // Plan how to draw the arrows
      this.graph.roots.forEach(node => {
        this.generateArrows(node);
      });

      // Create a placement plan that leaves room for arrows
      for ( let row in this.rowLanes_ ) {
        this.placement_.makeRoomInRow(row,
          Object.keys(this.rowLanes_[row]).length);
      }
      for ( let col in this.colLanes_ ) {
        this.placement_.makeRoomInCol(col,
          Object.keys(this.colLanes_[col]).length);
      }

      var g = this.start('svg');
      this.svg = g;
      g.attrs({
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': '0 0 ' +
          ('' + (this.placement_.width)) + ' ' +
          ('' + (this.placement_.height)),
        width: this.placement_.width * this.zoom,
        height: this.placement_.height * this.zoom
      });
      this.graph.roots.forEach(node => {
        this.renderBoxes(g, node);
      });
      this.graph.roots.forEach(node => {
        this.renderArrows(g, node);
      });
    },
    function renderBoxes(g, node, parent) {
      var self = this;
      var coords = this.placement_.getPlacement(node);
      if ( coords == null ) {
        throw new Error(
          `DAGView can't get a placement for this node; is it in the graph?`);
        return;
      }

      // coords[0] += -5 + Math.floor(Math.random() * 10);
      // coords[1] += -5 + Math.floor(Math.random() * 10);

      g
        .callIf(! self.alreadyRendered_[node.id], function () {
          self.alreadyRendered_[node.id] = true;

          var args = {
            of: node.data.cls_,
            data: node.data,
            position: coords,
            size: self.cellSize
          }

          if ( self.selectedNodeId && self.nodeViewClass_.hasOwnAxiom("isSelected") ){ 
            args.isSelected$ = self.slot(function(selectedNodeId) {
              return selectedNodeId === node.data.id; 
            })
          }

          if ( self.gridGap && self.nodeViewClass_.hasOwnAxiom("gridGap") ){
            args.gridGap = self.gridGap
          }
          
          this
            .start(self.Draggable, {
              pos: self.Position.create({
                x: coords[0],
                y: coords[1]
              })
            })
              .call(function () {
                self.nodeDraggables_[node.id] = this;
              })
              .attrs({
                // transform: `translate(${coords[0]},${coords[1]})`,
                width: self.cellSize[0],
                height: self.cellSize[1]
              })
              .tag(self.nodeView, args)
            .end()
        })
        // .callIf(parent, function () {
        //   var pcoords = self.placement_.getPlacement(parent);
        //   this
        //     .tag(self.VHVArrowLine, {
        //       startPos: [
        //         // TODO: cell lanes
        //         pcoords[0] + 0.5*self.cellSize,
        //         pcoords[1] + self.cellSize,
        //       ],
        //       endPos: [
        //         // TODO: cell lanes
        //         coords[0] + 0.5*self.cellSize,
        //         coords[1],
        //       ]
        //     })
        //     .tag(self.SimpleArrowHead, {
        //       originPos: [
        //         // TODO: cell lanes
        //         coords[0] + 0.5*self.cellSize,
        //         coords[1],
        //       ],
        //       angle: 0,
        //       size: 5
        //     })
        // })
        ;

      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.renderBoxes(g, childNode, node);
      })
    },
    function renderArrows(g, node, parent) {
      const self = this;
      if ( parent ) {
        let arrows = this.arrows_[parent.id][node.id];

        let enterCell, exitCell;
        (() => {
          // These variables are in a closure to prevent use after this
          let parentGridCoords = this.gridPlacement.getPlacement(parent);
          let nodeGridCoords = this.gridPlacement.getPlacement(node);
          enterCell = nodeGridCoords;
          exitCell = [parentGridCoords[0], parentGridCoords[1] + 1];
        })();

        for ( let arrow of arrows ) {
          let anchors = [];
          let enterCellLane = this.cellSize[1] * this.cellLaneRatio_(arrow.enterCellLane);
          let exitCellLane = this.cellSize[1] * this.cellLaneRatio_(arrow.exitCellLane);

          const parentDraggable = this.nodeDraggables_[parent.id];
          const nodeDraggable = this.nodeDraggables_[node.id];

          // Start first row after exiting the node
          if ( arrow.hasOwnProperty('topRowLane') ) {
            anchors.push(self.Position.create({
              x$: parentDraggable.pos.x$.map(x => x + exitCellLane),
              y: this.placement_.getRowLanePosition(exitCell[1], arrow.topRowLane)
            }))
          }

          if ( arrow.hasOwnProperty('columnLane') ) {
            // Start column from the row connecting to the parent
            anchors.push(self.Position.create({
              x: this.placement_.getColLanePosition(enterCell[0], arrow.columnLane),
              y: this.placement_.getRowLanePosition(exitCell[1], arrow.topRowLane)
            }))

            // Start second row from the column
            anchors.push(self.Position.create({
              x: this.placement_.getColLanePosition(enterCell[0], arrow.columnLane),
              y: this.placement_.getRowLanePosition(enterCell[1], arrow.bottomRowLane)
            }))
          }

          // Penultimate line meets line connecting to enterCell
          var lane = arrow.hasOwnProperty('bottomRowLane')
            ? arrow.bottomRowLane : arrow.topRowLane ;
          anchors.push(self.Position.create({
            x$: nodeDraggable.pos.x$.map(x => x + enterCellLane),
            y: this.placement_.getRowLanePosition(enterCell[1], lane)
          }))

          // TODO: calculate cell lane factor
          g.tag(this.SegmentedArrowLine, {
            startPos: self.RelativePosition.create({
              reference: self.nodeDraggables_[parent.id].pos,
              amount: self.Position.create({
                x: exitCellLane,
                y: this.cellSize[1]
              })
            }),
            endPos: self.RelativePosition.create({
              reference: self.nodeDraggables_[node.id].pos,
              amount: self.Position.create({
                x: enterCellLane,
                y: 0
              })
            }),
            anchors: anchors,
            testing: {
              node: node,
              parent: parent,
              arrow: arrow
            }
          });
          
          if ( this.isArrowheadShown ){
            g.tag(this.SimpleArrowHead, {
              pos: self.Position.create({
                x$: nodeDraggable.pos.x$.map(x => x + enterCellLane),
                y$: nodeDraggable.pos.y$
              }),
              angle: 0,
              size: 5
            })
          }
        }
      }
      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.renderArrows(g, childNode, node);
      })
    },
    function generateArrows(node, parent) {
      if ( parent ) {
        // Ensure list of arrows exists
        if ( ! this.arrows_[parent.id] )
          this.arrows_[parent.id] = {};
        if ( ! this.arrows_[parent.id][node.id] )
          this.arrows_[parent.id][node.id] = [];

        let parentCoords = this.gridPlacement.getPlacement(parent);
        let nodeCoords = this.gridPlacement.getPlacement(node);

        var yAdj = 1

        if ( this.embeddedSecondaryRelationshipStrategy ){
          // get the scaled node side of the parent to determin if there is truly a dY
          yAdj = this.embeddedSecondaryRelationshipStrategy.getBaseCellSize(parent)[1];
        }

        let hasDX = parentCoords[0] - nodeCoords[0] != 0;
        let hasDY = parentCoords[1] - nodeCoords[1] != -yAdj;

        let enterCell = nodeCoords;
        let exitCell = [parentCoords[0], parentCoords[1] + yAdj];

        let arrow = this.ArrowPlan.create({
          // Swap these to enable arrowhead sharing
          // enterCellLane: 0,
          enterCellLane: this.getCellLane(enterCell, Math.random()/*parent.id*/),
          enterCellLane: this.getCellLane(enterCell, parent.id),
          exitCellLane: this.getCellLane(exitCell, parent.id)
        });

        if ( hasDX || hasDY ) {
          let row = exitCell[1];
          arrow.topRowLane = this.getLane(this.rowLanes_, row, node.id, parent.id);
        }

        if ( hasDY ) {
          let row = enterCell[1];
          arrow.bottomRowLane = this.getLane(this.rowLanes_, row, node.id, parent.id);
          let col = enterCell[0];
          // Swap these to disable column sharing
          // arrow.columnLane = this.getLane(this.colLanes_, col, parent.id);
          arrow.columnLane = this.getLane(this.colLanes_, col, node.id, parent.id);
        }

        this.arrows_[parent.id][node.id].push(arrow);
      }
      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.generateArrows(childNode, node);
      })
    },
    function getCellLane(cell, id) {
      return this.getLane(this.cellLanes_, this.hash_(...cell), id);
    },
    function getLane(laneMap, index, toNode, fromNode) {
      var lanes = laneMap[index] || {};
      for ( let k in lanes ) {
        if ( lanes[k] == toNode ) return k;
        if ( fromNode && lanes[k] == fromNode ) return k;
        if ( fromNode && lanes[k].includes(':') ) {
          var parts = lanes[k].split(':');
          if ( parts[0] == toNode ) {
            lanes[k] = toNode;
            return k;
          }
          if ( parts[1] == fromNode ) {
            lanes[k] = fromNode;
            return k;
          }
        }
      }
      var lane = Object.keys(lanes).length;
      laneMap[index] = { ...lanes, [lane]: fromNode ? `${toNode}:${fromNode}` : toNode };
      return lane;
    },
    function hash_(x, y) {
      return (x + y) * (x + y + 1) / 2 + x;
    },
    function cellLaneRatio_(lane) {
      // f0 produces the series: [1 2 2 4 4 4 4....] as v increases from 0.
      //  Multiplying the output of f0 by 2 gives the denominator
      // Needs to look into centering it for multi leaf nodes
      let f0 = v => Math.pow(2, Math.floor(Math.log2(v+1)));

      // f1 produces the series: [1 1 3 1 3 5 7....] as v increases from 0.
      // ???: If this has a formal name please let me know
      let f1 = v => (v - f0(v) + 2) * 2 - 1;

      return f1(lane) / (2*f0(lane));
    }
  ]
});
