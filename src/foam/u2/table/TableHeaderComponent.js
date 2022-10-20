/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.table',
  name: 'TableHeaderComponent',
  extends: 'foam.u2.table.TableComponentView',

  imports: [
    'colWidthUpdated?',
    'props',
    'selectedColumnsWidth?'
  ],

  messages: [
    { name: 'TOOLTIP', message: 'Drag to Resize' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showResize'
    },
    {
      class: 'Int',
      name: 'colWidth',
      factory: function() {
        return this.selectedColumnsWidth && this.selectedColumnsWidth[this.propName] ?
        this.selectedColumnsWidth[this.propName] :
        this.columnHandler.returnPropertyForColumn(this.props, this.data.of, [this.col, this.overrides], 'tableWidth');
      },
      postSet: function(o, n) {
        this.updateWidths(n);
      }
    },
    {
      name: 'col',
      documentation: 'column name for which header needs to be rendered'
    },
    {
      name: 'overrides',
      documentation: 'overrides to be applied on given column'
    },
    {
      class: 'Boolean',
      name: 'resizeable',
      value: true
    },
    // Used internally to control dragging funcitonality.
    // All these and the listeners can be removed in
    // favour of css `resize: horizontal` if flexbox support is added
    'propName',
    'oldX_',
    'oldCW_',
    ['isDragging_', false],
    'dragImg_'
  ],

  methods: [
    function render() {
      var self = this;
      var view = this.data;
      this.propName = this.columnHandler.propertyNamesForColumnArray(this.col);
      var found = this.props.find(p => p.fullPropertyName === self.propName);
      var prop = found ? found.property : this.data.of.getAxiomByName(self.propName);
      var isFirstLevelProperty = this.columnHandler.canColumnBeTreatedAsAnAxiom(this.col) ? true : this.col.indexOf('.') === -1;
      
      if ( ! prop ) return;

      this.dragImg_ = document.createElement('img');
      this.dragImg_.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

      var colData = this.columnConfigToPropertyConverter.returnColumnHeader(this.data.of, this.col);
      var colHeader = ( colData.colPath.length > 1 ? '../'  : '' ) + ( colData.colLabel || colData.colPath.slice(-1)[0] );
      var colTooltip = colData.colPath.join( '/' );
      this
        .addClass(view.myClass('th'))
        .on('mouseenter', this.onMouseEnter)
        .on('mouseleave', this.onMouseLeave)
        .addClass(view.myClass('th-' + prop.name))
        .style({
          'align-items': 'center',
          display: 'flex',
          flex: this.slot(function(colWidth) {
            return colWidth ? `1 0 ${colWidth}px` : `1 0 ${this.data.MIN_COLUMN_WIDTH_FALLBACK}px`
          }),
          'justify-content': 'space-between',
          'word-wrap': 'break-word'
        })
        .start()
          .style({ display: 'flex',overflow: 'hidden' })
            .start('', { tooltip: colTooltip })
              .addClass('h600')
              .style({
                overflow: 'hidden',
                'text-overflow': 'ellipsis'
              })
              .add(colHeader)
            .end()
            .callIf(isFirstLevelProperty && prop.sortable, function() {
              var currArrow = view.restingIcon;
              this.on('click', function(e) {
                view.sortBy(prop);
              }).
              callIf(prop.label !== '', function() {
                this.start()
                  .start('img')
                    .style({ 'max-width': 'initial' })
                    .attr('src', this.slot(function(view$order) {
                      var order = view$order;
                      if ( prop === order ) {
                        currArrow = view.ascIcon;
                      } else {
                        if ( view.Desc.isInstance(order) && order.arg1 === prop )
                        currArrow = view.descIcon;
                      }
                      return currArrow;
                    }, view.order$))
                  .end()
                .end();
              });
            })
        .end()
        .startContext({data: this})
          .start(this.DRAG_TO_RESIZE, { buttonStyle: 'TERTIARY', themeIcon: 'drag', size: 'SMALL' })
            .addClass(this.data.myClass('resizeButton'))
            .enableClass(this.data.myClass('resizeCursor'), this.showResize$)
            .attrs({ draggable: 'true' })
            .on('dragstart', self.dragStart.bind(self))
            .on('drag', self.drag.bind(self))
            .on('dragend', self.dragEnd.bind(self))
            .show(this.showResize$)
          .end()
        .endContext();
    }
  ],

  listeners: [
    {
      name: 'dragStart',
      code: function(evt) {
        this.isDragging_ = true;
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
        evt.dataTransfer.setDragImage(this.dragImg_, 0, 0);
        this.oldX_ = evt.clientX;
        this.oldCW_ = this.colWidth || this.data.MIN_COLUMN_WIDTH_FALLBACK;
      }
    },
    {
      name: 'drag',
      code: function(evt) {
        evt.preventDefault();
        var w = this.oldCW_ + evt.clientX - this.oldX_;
        if ( w > this.data.MIN_COLUMN_WIDTH_FALLBACK ) {
          this.colWidth = w;
        }
      }
    },
    {
      name: 'dragEnd',
      code: function(evt) {
        this.drag(evt);
        this.isDragging_ = false;
        this.showResize = false;
      }
    },
    function onMouseEnter() {
      this.showResize = true;
    },
    function onMouseLeave() {
      if ( this.isDragging_ ) return;
      this.showResize = false;
    },
    {
      name: 'updateWidths',
      isFramed: true,
      code: function(width) {
        if ( ! this.selectedColumnsWidth$ || ! this.colWidthUpdated$ ) return;
        this.selectedColumnsWidth[this.propName] = width;
        this.colWidthUpdated = ! this.colWidthUpdated;
      }
    }
  ],
  actions: [
    {
      name: 'DragToResize',
      label: '',
      toolTip: 'Drag to resize',
      isAvailable: function(resizeable) { return resizeable; },
      code: function() {}
    }
  ]
});
