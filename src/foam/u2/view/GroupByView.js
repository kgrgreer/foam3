/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'GroupByView',
  extends: 'foam.u2.view.ColumnConfigPropView',
  requires: ['foam.u2.view.GroupByViewRow', 'foam.u2.UnstyledTableView','foam.u2.view.SubColumnSelectConfig'],
  properties: [
    'data',
    'selectedCol',
    {
      name: 'columns',
      factory: function() {
        var tc = this.data.of.getAxiomByName('tableColumns').columns;
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
            //isPropertySelected: false,
            onDragAndDropParentFunction: undefined,
            onSelectionChangedParentFunction: this.onTopPropertiesSelectionChange.bind(this),
            onDragAndDrop: undefined,
            onSelectionChanged: this.onSelectionChanged.bind(this)
          }));
        }
        return arr;
      }
    }
  ]
  ,
  methods: [
    function render() {
      this.SUPER()
    },
    function onSelect(draggableIndex, views) {
      if ( this.selectCol ) {
        this.selectCol.isPropertySelected = true;
      }
      console.log("select");
        var tc = views[draggableIndex].prop.rootProperty[0];
        console.log(tc);
        axiom = this.data.of.getAxiomByName(tc);
        console.log(axiom);
        this.data.groupBy = axiom; 
        this.selectCol = views[draggableIndex].prop;
        views[draggableIndex].prop.isPropertySelected = ! views[draggableIndex].prop.isPropertySelected;
    },
    function onUnSelect(draggableIndex, views) {
      console.log("unselect");
      this.data.groupBy = undefined;
      this.selectCol = undefined;
      views[draggableIndex].prop.isPropertySelected = ! views[draggableIndex].prop.isPropertySelected;
    },
    function rebuildSelectedColumns() {
      //NO-OP
    },
    function getColumns(tc){
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
            isPropertySelected: true,
            level:0,
            of:data.of,
            selectedColumns$: data.selectedColumnNames$,
          }, this));
          topLevelProps.push(rootPropertyName);
        }
      }
      return arr;
    }
  ],
  actions: [
    {
      name: 'resetColumns',
      label: 'Reset Columns',
      code: function() {
        this.data.groupBy = undefined;
        this.selectCol.isPropertySelected = true;
        this.selectCol = undefined;
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
                    if ( ! this.data.isPropertySelected ) {
                      image = self.theme.glyphs.folderFill.getDataUrl({ fill: self.theme.primary3});
                    } else {
                      image = self.theme.glyphs.folderOutline.getDataUrl({ fill: self.theme.grey4});
                    }
                    return this.E().start(self.Image, { data: image , displayHeight: '1.5em' , displayWidth: '1.5em'}).end() 
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
              isPropertySelected: true,
              onDragAndDrop:this.onDragAndDrop,
              onSelectionChanged:this.onSelectionChanged,
              onSelectionChangedParentFunction:this.onChildrenSelectionChanged.bind(this),
              onDragAndDropParentFunction: this.onChildrenDragAndDrop.bind(this),
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
    methods:[
      function render(){
        this.SUPER();
      },
      function returnSubColumnSelectConfig(subProperties, level, expanded, ignoreExpanded ) {
        var arr = [];
        if ( ! this.of || ! this.of.getAxiomByName || subProperties.length === 0 || ( ! ignoreExpanded && ! expanded ) )
            return arr;
          var l = level + 1;
          var r = this.of.getAxiomByName(this.rootProperty[0]);
          if ( ! r )
            return arr;
  
          var selectedSubProperties = [];
          var otherSubProperties = [];
  
          var thisRootPropName = this.columnHandler.checkIfArrayAndReturnPropertyNameForRootProperty(this.rootProperty);
          //find selectedColumn for the root property
          var selectedColumn = this.selectedColumns.filter(c => {
            var thisSelectedColumn = foam.String.isInstance(c) ? c : c.name;
            return ( ! foam.String.isInstance(c) && this.level === 0 && thisSelectedColumn === thisRootPropName ) ||
            ( foam.String.isInstance(c) && c.split('.').length >= this.level && c.split('.')[this.level] === this.rootProperty[0] );
          });
  
          for ( var i = 0 ; i < subProperties.length ; i++ ) {
            //the comparison mentioned above is working with the assumption that columns which are specified in 'tableColumns' are top-level properties and
            //we are not using nested "custom" table columns
            if ( selectedColumn.find(c => foam.String.isInstance(c) && c.split('.').length > ( this.level + 1 ) && c.split('.')[this.level+1] === subProperties[i][0]) ) {
              selectedSubProperties.push(subProperties[i]);
            } else {
              otherSubProperties.push(subProperties[i]);
            }
          }
          otherSubProperties.sort((a, b) => { return a[1].toLowerCase().localeCompare(b[1].toLowerCase());});
  
          for ( var i = 0 ; i < selectedSubProperties.length ; i++ ) {
            arr.push(this.cls_.create({
              index: i,
              rootProperty: selectedSubProperties[i],
              selectedColumns$: this.selectedColumns$,
              level: l,
              parentExpanded$: this.expanded$,
              of: r.of,
              isPropertySelected: true
            }));
          }
  
          for ( var i = 0 ; i < otherSubProperties.length ; i++ ) {
            arr.push(this.cls_.create({
              index: selectedSubProperties.length + i,
              rootProperty: otherSubProperties[i],
              selectedColumns$: this.selectedColumns$,
              level:l, parentExpanded$: this.expanded$,
              of: r.of,
              isPropertySelected: true
            }, this));
          }
  
          return arr;
      }
    ]
  });
