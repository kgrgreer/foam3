/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 // TODO:
 // permission dependency graph is too complex given @group permissions
 // so instead of maintaining graph just invalidate all states and then just
 // recalculate lazily whenever any checkbox is clicked
 // invalidated values should still maintain their previous value while
 // being recalculated
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.graphics.ScrollCView',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.Permission'
  ],

  imports: [
    'auth',
    'groupDAO',
    'groupPermissionJunctionDAO',
    'permissionDAO',
    'user'
  ],

  constants: {
    COLS: 26,
    ROWS: 19
  },

  css: `
    ^ thead th {
      background:$white;
      padding: 0;
      text-align: center;
    }

    ^ tbody td {
      text-align: center;
    }

    tbody {
       overflow: auto;
       width: 100%;
       height: 150px;
     }

    ^ tbody tr { background:$white; }

    ^ .foam-u2-md-CheckBox {
      margin: 1px;
      border: none;
    }

    ^ .foam-u2-md-CheckBox:hover {
      background: #FFCCCC;
    }

    ^hovered {
      background: #ccc !important;
    }

    ^ table {
       box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
       width: auto;
       border: 0;
      }

    ^header {
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
      background:$white;
      padding: 8px;
      margin: 8px 0;
    }

    ^ .permissionHeader {
      background:$white;
      color: #444;
      text-align: left;
      padding-left: 6px;
    }

    ^table-wrapper {
      display: flex;
      overflow: auto;
    }

    ^ thead th {
      position: sticky;
      top: 0;
    }

    ^ tbody td:first-child, ^ thead th:first-child {
      position: sticky;
      left: 0;
      z-index: 2;
    }

    ^groupLabel {
      font-weight: normal;
      padding-top: 4px;
      writing-mode: vertical-lr;
      white-space: nowrap;
      background: white;
    }

  `,

  properties: [
    {
      class: 'String',
      name: 'query',
      postSet: function() { this.skip = 0; },
      view: {
        class: 'foam.u2.TextField',
        type: 'Search',
        placeholder: 'Permission Search',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'gQuery',
      postSet: function() { this.gSkip = 0; },
      view: {
        class: 'foam.u2.TextField',
        type: 'Search',
        placeholder: 'Group Search',
        onKey: true
      }
    },
    {
      name: 'columns_',
      documentation: 'Array for managing checked groups'
    },
    {
      name: 'textData',
      documentation: 'input text value by user'

    },
    {
      class: 'Map',
      name: 'gpMap'
    },
    {
      class: 'Map',
      name: 'gMap'
    },
    {
      class: 'Map',
      name: 'pMap'
    },
    {
      class: 'Int',
      name: 'skip'
    },
    {
      class: 'Int',
      name: 'gSkip',
      preSet: function(_, skip) { if ( skip === undefined || skip === null ) debugger; return skip || 0; }
    },
    'ps', /* permissions array */
    'gs', /* groups array */
    'currentGroup',
    'currentPermission',
    {
      name: 'filteredPs',
      expression: function(ps, query) {
        query = query.trim();
        return ps.filter(function(p) {
          return query == '' || p.id.indexOf(query) != -1;
        });
      }
    },
    {
      name: 'filteredRows',
      expression: function(filteredPs) {
        return filteredPs.length;
      }
    },
    {
      name: 'filteredGs',
      expression: function(gs, gQuery) {
        gQuery = gQuery.trim();
        return gs.filter(function(g) {
          return gQuery == '' || g.id.indexOf(gQuery) != -1;
        });
      }
    },
    {
      name: 'filteredCols',
      expression: function(filteredGs) {
        return filteredGs.length;
      }
    }
  ],

  methods: [
    async function matrix() {
      var ps   = this.filteredPs, gs = this.filteredPs;
      var self = this;
      var perms = await this.groupPermissionJunctionDAO.select();
      perms.array.forEach(perm => {
        var g = perm.sourceId, p = perm.targetId;
        var key = p + ':' + g;

        var data = this.GroupPermission.create({
          checked: true
        });

        data.checked$.sub(function() {
          self.updateGroup(p, g, data.checked$, self);
        });

        this.gpMap[key] = data;
      });

      this
        .addClass(this.myClass())
        .style({
          'padding-left':  '16px',
          'padding-top':   '0',
          'padding-right': '16px',
        })

        .start()
          .addClass(this.myClass('header'))
          .start('span')
            .style({padding: '8px'})
            .add('Permission Matrix')
          .end()
          .add(this.G_QUERY, ' ', this.QUERY)
        .end()

        .add(this.slot(this.table))

        .start('div')
          .start(self.ScrollCView.create({
            value$:   self.gSkip$,
            extent$:  self.filteredCols$.map(m => Math.min(self.COLS, m)),
            width$:   self.filteredCols$.map(m => m * 26),
            vertical: false,
            height:   26,
            size$:    self.filteredCols$
          }))
          .end()
          .style({float: 'right', 'padding-right': '26px'})
        .end();
    },

    function table(filteredPs, filteredGs, gSkip) {
      var ps   = filteredPs, gs = filteredGs;
      var self = this;

      return this.E().start()
        .addClass(this.myClass('table-wrapper'))
        .start('table')
          .style({ 'width': '100%', 'flex': '1' })
          .on('wheel', this.onWheel, {passive: true})
          .start('thead')
            .start('tr')
              .start('th')
                .attrs({colspan:1000})
                .style({'text-align': 'left', padding: '8px', 'font-weight': 400})
                .call(self.count, [self])
              .end()
            .end()
            .start('tr')
              .start('th')
                .style({minWidth: '510px'})
              .end()
              .call(function() { self.tableColumns.call(this, gs, self); })
            .end()
          .end()
          .add(this.slot(this.tableBody))
        .end()
        .start(self.ScrollCView.create({
          value$: self.skip$,
          extent: self.ROWS,
          height: self.ROWS*25,
          width: 26,
          size$: self.filteredRows$.map(function(m){return m-1;})
        }))
          .style({gridColumn: '2/span 1', gridRow: '2/span 2', 'margin-top':'236px'})
        .end()
      .end();
    },

    function tableBody(skip, gSkip, filteredPs) {
      var ps   = this.filteredPs, gs = this.filteredGs.slice(gSkip, gSkip+this.COLS);
      var self = this, count = 0;
      return self.E('tbody').forEach(filteredPs, function(p) {
        if ( count >= skip + self.ROWS ) return;
        if ( count++ < skip ) return;
        this.start('tr')
          .start('td')
            .enableClass(self.myClass('hovered'), self.currentPermission$.map(function(cp) { return cp === p; } ))
            .addClass('permissionHeader')
            .attrs({title: p.description})
            .style({width: '600px', 'max-width': '600px', overflow: 'auto'})
            .add(p.id)
          .end()
          .forEach(gs, function(g) {
            this.start('td')
              .on('mouseover', function() { self.currentGroup = g; self.currentPermission = p; })
              // removed mouseout because it just caused flicker
              .enableClass(self.myClass('hovered'), self.slot(function(currentGroup, currentPermission) { return currentGroup == g || currentPermission == p; }))
//              .attrs({title: g.id + ' : ' + p.id}) // Not needed becasue with scrollbars, col&row labels are always visible
              .tag(self.createCheckBox(p, g))
            .end();
          })
        .end();
      });
    },

    function count(self) {
      var msg = self.filteredRows + ' of ' + self.ps.length + ' permissions, ';
      msg += self.filteredCols + ' of ' + self.gs.length + ' groups';

      this.add(msg);
    },

    // * -> null, foo.bar -> foo.*, foo.* -> *
    function getParentGroupPermission(p, g) {
      var pid = p.id;
      while ( true ) {
        while ( pid.endsWith('.*') ) {
          pid = pid.substring(0, pid.length-2);
        }
        if ( pid == '*' ) return null;
        var i = pid.lastIndexOf('.');
        pid = ( i == -1 ) ? '*' : pid.substring(0, i) + '.*';
        if ( pid in this.pMap ) return this.getGroupPermission(g, this.pMap[pid]);
      }
    },

    function getGroupPermission(g, p) {
      var key  = p.id + ':' + g.id;
      var data = this.gpMap[key];
      var self = this;

      if ( ! data ) {
        data = this.GroupPermission.create({
          checked: false
        });

        data.checked$.sub(function() {
          self.updateGroup(p, g, data.checked$, self);
        });

        // data.impliedByParentPermission = ! data.checked && g.implies(p.id);

        // Parent Group Inheritance
        this.dependOnGroup(g.parent, p, data);

        // Parent Permission Inheritance (wildcarding)
        var pParent = this.getParentGroupPermission(p, g);
        if ( pParent ) {
          function update2() {
            data.impliedByParentPermission = pParent.granted;
          }
          update2();
          this.onDetach(pParent.granted$.sub(update2));
        }

        this.gpMap[key] = data;
      }

      return data;
    },

    function dependOnGroup(g, p, data) {
      if ( ! g ) return;

      var a = this.gMap[g];
      if ( a ) {
        var parent = g && this.getGroupPermission(a, p);
        if ( parent ) {
          function update() {
            if ( parent.granted ) {
              data.impliedByGroups[a.id] = true;
            } else {
              delete data.impliedByGroups[a.id];
            }
            data.impliedByGroup = !! Object.keys(data.impliedByGroups).length;
          }
          update();
          this.onDetach(parent.granted$.sub(update));
        }
      }
    },

    function createCheckBox(p, g) {
      // Disable adding a group role to that group itself.
      // TODO: should be protected in the model as well to prevent
      // updating through Group GUI, DIG or API. Also, should prevent
      // loops.
      if ( p.id == '@' + g.id ) return this.E().add('X');
      var self = this;
      return function() {
        return self.GroupPermissionView.create({data: self.getGroupPermission(g, p)});
      };
    },

    function tableColumns(gs, matrix) {
      gs = gs.slice(matrix.gSkip, matrix.gSkip+matrix.COLS);
      var self = this;
      this.forEach(gs, function(g) {
        this.start('td')
          .style({'white-space': 'pre'})
          .attrs({title: g.description})
          .addClass(matrix.myClass('groupLabel'))
          .enableClass(matrix.myClass('hovered'), matrix.currentGroup$.map(function(cg) { return cg === g; } ))
          .add(g.displayName_)
        .end();
      });
    },

    function render() {
      this.SUPER();
      var self = this;

      this.groupDAO.orderBy(this.Group.ID).select().then(function(gs) {
        gs = gs.array;

        var gs2 = [];
        function findChildren(parent, prefix) {
          for ( var i = 0 ; i < gs.length ; i ++ ) {
            var g = gs[i];
            if ( g.parent === parent ) {
              gs2.push(g);
              g.displayName_ = prefix ? prefix + '┌ ' + g.id : g.id;
              findChildren(g.id, prefix + '   ');
            }
          }
        }
        findChildren('', '');
        gs = gs2;
        for ( var i = 0 ; i < gs.length ; i++ ) {
          self.gMap[gs[i].id] = gs[i];
        }
        self.permissionDAO.orderBy(self.Permission.ID).select().then(function(ps) {
          for ( var i = 0 ; i < ps.array.length ; i++ ) {
            self.pMap[ps.array[i].id] = ps.array[i];
          }
          self.gs = gs;
          self.ps = ps.array;
          self.matrix();
        })
      });
    },

    function updateGroup(p_, g_, data, self) {
      var dao = this.groupPermissionJunctionDAO;
      var obj = this.GroupPermissionJunction.create({sourceId: g_.id, targetId: p_.id});

      if ( data.get() ) {
        // Add permission
        dao.put(obj);
      } else {
        // Remove permission
        dao.remove(obj);
      }
    }
  ],

  listeners: [
    {
      name: 'onWheel',
      isFramed: true,
      code: function(e) {
        function process(skip, delta) {
          var negative = delta < 0;
          // Convert to rows, rounding up. (Therefore minumum 1.)
          var num = Math.ceil(Math.abs(delta) / 40);
          return Math.max(0, skip + (negative ? -num : num));
        }
        this.skip  = process(this.skip,  e.deltaY);
        this.gSkip = process(this.gSkip, e.deltaX);
        e.preventDefault();
      }
    }
  ],

  classes: [
    {
      name: 'GroupPermission',
      properties: [
        {
          class: 'Boolean',
          name: 'checked'
        },
        {
          class: 'Boolean',
          name: 'impliedByParentPermission'
        },
        {
          class: 'Map',
          name: 'impliedByGroups'
        },
        {
          class: 'Boolean',
          name: 'impliedByGroup'
        },
        {
          class: 'Boolean',
          name: 'implied',
          expression: function(impliedByParentPermission, impliedByGroup) {
            return impliedByParentPermission || impliedByGroup;
          }
        },
        {
          class: 'Boolean',
          name: 'granted',
          expression: function(checked, implied) {
            return checked || implied;
          }
        }
      ]
    },
    {
      name: 'GroupPermissionView',
      extends: 'foam.u2.View',
      css: `
        ^:hover { background: #f55 }
        ^checked { color: #4885ff }
        ^implied { color: gray }
      `,
      methods: [
        function init() {
          // TODO: setting the tooltip doesn't work from render() in U2, but does in U3
          if ( this.data.impliedByGroup ) {
            this.tooltip = "Implied by " + Object.keys(this.data.impliedByGroups).join(', ');
          }
        },
        function render() {
          this.SUPER();
          this.
            addClass(this.myClass()).
            style({height: '18px'}).
            enableClass(this.myClass('implied'), this.data.checked$, true).
            enableClass(this.myClass('checked'), this.data.checked$).
            add(this.slot(function(data$granted, data$implied, data$impliedByGroup) {
              if ( ! data$granted      ) return '';
              if ( data$impliedByGroup ) return '←';
              if ( data$implied        ) return '↑';
              return '✓';
            })).
            on('click', this.onClick);
        }
      ],
      listeners: [
        function onClick() {
          this.data.checked = ! this.data.checked;
        }
      ]
    }
  ]
});
