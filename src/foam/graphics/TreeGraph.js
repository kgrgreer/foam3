
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.graphics',
   name: 'TreeGraph',
   extends: 'foam.graphics.Box',

   requires: [
    'foam.graphics.TreeNode'
   ],

   exports: [
     'as graph',
     'formatNode',
     'relationship',
     'isAutoExpandedByDefault',
     'childNodesForAutoExpansion',
     'classToTreeNodeConfig'
   ],

   properties: [
     [ 'canvasMinWidth',     1374],
     [ 'canvasMinHeight',     750],
     [ 'nodeWidth',          155 ],
     [ 'nodeHeight',          60 ],
     [ 'nodeCornerRadius',     0 ],
     [ 'lineWidth',          0.5 ],
     [ 'padding',             60 ],
     [ 'color',           'white'],
     [ 'border',           'gray'],
     [ 'connectorWidth',      0.5],
     [ 'connectorColor',   'gray'],
     {
       name: 'data'
     },
     {
       name: 'relationship'
     },
     'root',
     {
       name: 'formatNode',
       value: function() {}
     },
     {
       class: 'Boolean',
       name: 'isAutoExpandedByDefault',
       value: true
     },
     {
       class: 'Int',
       name: 'childNodesForAutoExpansion',
       value: 5
     },
     {
      class: 'Map',
      name: 'classToTreeNodeConfig'
     },
     {
      class: 'Boolean',
      name: 'isCentering'
     }
   ],

   topics: [
    'onSizeChangeComplete'
   ],

   methods: [
     function initCView() {
       this.SUPER();

       if ( this.data ) {
        var treeNodeConfig = this.classToTreeNodeConfig[this.data.cls_.id];

        var treeNodeWidth = treeNodeConfig && treeNodeConfig.width
          ? treeNodeConfig.width
          : this.nodeWidth;
        
        var treeNodeHeight = treeNodeConfig && treeNodeConfig.height
          ? treeNodeConfig.height
          : this.nodeHeight;

        var treeNodeCornerRadius = treeNodeConfig && treeNodeConfig.nodeCornerRadius
          ? treeNodeConfig.nodeCornerRadius
          : this.nodeHeight;

        var treeNodeExpandIconColor = treeNodeConfig && treeNodeConfig.expandIconColor
          ? treeNodeConfig.expandIconColor
          : this.expandIconColor;

        var treeNodeExpandIconWidth = treeNodeConfig && treeNodeConfig.expandIconWidth
          ? treeNodeConfig.expandIconWidth
          : this.expandIconWidth;
        
        var treeNodeBorder = treeNodeConfig && treeNodeConfig.nodeBorder
          ? treeNodeConfig.nodeBorder
          : this.border;

        this.root = this.TreeNode.create({
          width:     treeNodeWidth,
          height:    treeNodeHeight,
          padding:   this.padding,
          lineWidth: this.lineWidth,
          y:         this.padding,
          data:      this.data,
          expandIconColor: treeNodeExpandIconColor,
          expandIconWidth: treeNodeExpandIconWidth,
          cornerRadius: treeNodeCornerRadius,
          border: treeNodeBorder
        });
        this.add(this.root); 
        this.doLayout();
       }
     }
   ],

   listeners: [
     {
       name: 'doLayout',
       isMerged: true,
       code: function() {
          if ( this.root && this.root.layout() ) {
            this.invalidate();
            this.doLayout();
          } else {
            this.updateCSize();
          }
        }
     },
     {
       name: 'updateCSize',
       isFramed: true,
       code: function() {
         const maxes  = {
           maxLeft:  Number.MAX_SAFE_INTEGER,
           maxRight: Number.MIN_SAFE_INTEGER
         }

         this.root.outline.forEach(level => {
           maxes.maxLeft  = Math.min(level.left, maxes.maxLeft);
           maxes.maxRight = Math.max(level.right, maxes.maxRight);
         })

         var width  = Math.abs(maxes.maxLeft - maxes.maxRight);
         this.height = this.canvasMinHeight;

         if ( 
            ( this.width != width )
            && ! this.isCentering
          ) {
           this.width  = width;

           this.root.centerX = 0;

           this.root.centerX = - Math.min.apply(Math, this.root.outline.map(o => o.left));

           // IMPORTANT: Have to add the extra invalidate and doLayout to avoid a bug with
           // the tree freezing upon render sometimes during search
           this.invalidate();
           this.doLayout();

           return;
         }

         if (
          this.width == width
          && this.width < this.canvasMinWidth
          && ! this.isCentering
         ){
          this.isCentering = true;

          this.root.centerX += ( this.canvasMinWidth - this.width )  / 2;

          this.width = this.canvasMinWidth;

          this.invalidate();
          this.doLayout();

          return;
         }

         this.isCentering = false;

         this.onSizeChangeComplete.pub();
      }
     }
   ]
 });
