/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'GroupByView',
  extends: 'foam.u2.view.ColumnConfigPropView',
  requires: [
    'foam.u2.view.GroupByViewRow', 
    'foam.u2.UnstyledTableView',
    'foam.u2.view.SubColumnSelectConfig'
  ],
  properties: [
    'data',
    'selectCol',
    {
      name: 'columns',
      factory: function() {
        var tc = this.data.allColumns;
        return this.getColumns(tc);
      }
    },
    {
      name: 'views',
      expression: function(columns) {
        var arr = [];
        for ( var i = 0 ; i < columns.length ; i++ ) {
          arr.push(this.RootColumnConfigPropView.create({
            index: i,
            prop:columns[i],
            head: { class:'foam.u2.view.GroupByViewHeader' },
            body: { class:'foam.u2.view.GroupByViewBody' },
            onSelectionChangedParentFunction: this.onTopPropertiesSelectionChange.bind(this),
            onSelectionChanged: this.onSelectionChanged.bind(this)
          }));
        }
        return arr;
      }
    }
  ]
  ,
  methods: [
    function onSelect(draggableIndex, views) {
      if ( this.selectCol ) {
        this.selectCol.isPropertySelected = false;
      }
      var tc = views[draggableIndex].prop.rootProperty[0];
      axiom = this.data.of.getAxiomByName(tc);
      this.data.groupBy = axiom;
      this.selectCol = views[draggableIndex].prop;
    },
    function onUnSelect(draggableIndex, views) {
      this.data.groupBy = undefined;
      this.selectCol = undefined;
    },
    function rebuildSelectedColumns() {
      //NO-OP
    },
    function getColumns(tc) {
      var data = this.data;
      var arr = [];
      var tableColumns = tc;
      var topLevelProps = [];
      for ( var i = 0 ; i < tableColumns.length ; i++ ) {
        var rootProperty;
        if ( foam.String.isInstance(tableColumns[i]) ) {
          var axiom;
          if ( tableColumns[i].includes('.') )
            axiom = data.of.getAxiomByName(tableColumns[i].split('.')[0]);
          else {
            axiom = tableColumns.find(c => c.name === tableColumns[i]);
            if ( ! axiom )
              axiom = data.of.getAxiomByName(tableColumns[i]);
          }
          if ( ! axiom ) {
            continue;
          }
          rootProperty = [ axiom.name, this.columnHandler.returnAxiomHeader(axiom) ];
        } else {
          rootProperty = tableColumns[i];
          }
        var rootPropertyName = this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(rootProperty);
        if ( ! topLevelProps.includes(rootPropertyName) ) {
          arr.push(foam.u2.view.SubColumnGroupByConfig.create({
            index:i,
            rootProperty:rootProperty,
            isPropertySelected: false,
            level:0,
            of:data.of,
            selectedColumns$: data.selectedColumnNames$,
          }, this));
          topLevelProps.push(rootPropertyName);
        }
      }
      arr.sort((a, b) => {
        var aName = this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(a.rootProperty);
        var bName = this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(b.rootProperty);
        return aName.toLowerCase().localeCompare(bName.toLowerCase());
      });
      return arr;
    }
  ],
  actions: [
    {
      name: 'resetColumns',
      label: 'Reset Columns',
      code: function() {
        if ( this.selectCol ) {
        this.data.groupBy = undefined;
        this.selectCol.isPropertySelected = false;
        this.selectCol = undefined;
        }
      }
    }
  ]
  });
  foam.CLASS({
    package: 'foam.u2.view',
    name: 'GroupByViewHeader',
    extends: 'foam.u2.view.ColumnViewHeader',
    imports: ['theme'],
    requires: ['foam.u2.tag.Image'],
    methods: [
      function render() {
        var self = this;
        this
          .start()
          .on('click', this.toggleSelection)
            .addClass(this.myClass('some-padding'))
            .style({
              'padding-left': self.data.level * 16 + 8 + 'px',
              'padding-right': '8px'
            })
            .start()
              .addClass(this.myClass('label'))
              .callIfElse( this.theme ,
                function() {
                  this.add(self.slot(function( data$isPropertySelected ) {
                    var image;
                    if ( this.data.isPropertySelected ) {
                      image = self.theme.glyphs.folderFill.getDataUrl({ fill: self.theme.primary3 });
                    } else {
                      image = self.theme.glyphs.folderOutline.getDataUrl({ fill: self.theme.grey4 });
                    }
                    return this.E().start(self.Image, { data: image , displayHeight: '1.5em' , displayWidth: '1.5em' }).end()
                  }))
                },
                function() {
                  this.start().add(self.CheckBox.create({ data$: self.data.isPropertySelected$ }))
                .end()
                }
              )
              .start()
                .style({'padding-left' : '12px'})
                .add(this.columnHandler.checkIfArrayAndReturnRootPropertyHeader(this.data.rootProperty))
              .end()
            .end()
            .start()
              .show(this.data.hasSubProperties)
              .style({
                'vertical-align': 'middle',
                'font-weight':    'bold',
                'visibility':     'visible',
                'font-size':      '16px',
                'float':          'right',
                'transform':      this.data.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)'; })
              })
              .on('click', this.toggleExpanded)
              .add('\u2303')
            .end()
          .end();
      }
    ],
    listeners: [
      function toggleSelection(e) {
        e.stopPropagation();
        if ( this.theme ) {
          this.data.isPropertySelected = ! this.data.isPropertySelected;
        }
        this.SUPER(e);
      }
    ]
  });
  foam.CLASS({
    package: 'foam.u2.view',
    name: 'GroupByViewBody',
    extends: 'foam.u2.view.ColumnViewBody',
    requires: ['foam.u2.view.GroupByViewHeader'],
    properties: [
      {
        name: 'views',
        expression: function(data$subColumnSelectConfig) {
          var arr = [];
          for ( var i = 0 ; i < this.data.subColumnSelectConfig.length ; i++ ) {
            arr.push(this.RootColumnConfigPropView.create({
              index: i,
              prop:this.data.subColumnSelectConfig[i],
              head: { class:'foam.u2.view.GroupByViewHeader' },
              body: { class:'foam.u2.view.GroupByViewBody' },
              isPropertySelected: false,
              onSelectionChanged:this.onSelectionChanged,
              onSelectionChangedParentFunction:this.onChildrenSelectionChanged.bind(this),
            }));
          }
          return arr;
        }
      }
    ]
  });
  foam.CLASS({
    package: 'foam.u2.view',
    name: 'SubColumnGroupByConfig',
    extends: 'foam.u2.view.SubColumnSelectConfig',
    properties: [
      {
        name: 'subProperties',
        expression: function(prop) {
          if ( ! this.of || ! this.of.getAxiomByName || this.level >= 1 )
            return [];
          if ( prop && prop.cls_ && ( foam.core.FObjectProperty.isInstance(prop) || foam.core.Reference.isInstance(prop) ) )
            return prop.of.getAxiomsByClass(foam.core.Property).map(p => [p.name, this.columnHandler.returnAxiomHeader(p)]);
          return [];
        }
      }
    ],
    methods:[
      function returnSubColumnSelectConfig(subProperties, level, expanded, ignoreExpanded) {
        var arr = [];
        if ( ! this.of || ! this.of.getAxiomByName || subProperties.length === 0 || ( ! ignoreExpanded && ! expanded ) )
            return arr;
          var l = level + 1;
          var r = this.of.getAxiomByName(this.rootProperty[0]);
          if ( ! r )
            return arr;
        
          subProperties.sort((a, b) => { return a[1].toLowerCase().localeCompare(b[1].toLowerCase());});
          for ( var i = 0 ; i < subProperties.length ; i++ ) {
            arr.push(this.cls_.create({
              index: i,
              rootProperty: subProperties[i],
              level: l,
              parentExpanded$: this.expanded$,
              of: r.of,
              isPropertySelected: false
            }));
          }
          return arr;
      }
    ]
  });
