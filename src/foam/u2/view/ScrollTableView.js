/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'ScrollTableView',
  extends: 'foam.u2.Element',

  documentation: `
  WARNING:This table view is not recieving functionality updates
              Use foam/u2/table/UnstyledTableView.js instead
  `,

  imports: [
    'getElementById',
    'memento?',
    'stack'
  ],

  exports: [
    'as summaryView',
    'dblclick as click',
    'dblclick',
    'currentMemento_ as memento'
  ],

  requires: [
    'foam.core.Lock',
    'foam.dao.FnSink',
    'foam.mlang.sink.Count',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ReadWriteView',
    'foam.u2.stack.StackBlock',
    'foam.u2.view.TableView',
    'foam.comics.v2.DAOControllerConfig',
    'foam.nanos.controller.Memento'
  ],

  css: `
    ^{
      border-radius: 4px;
      position: relative;
    }
    ^full-height{
      height: 100%;
    }
    ^table-wrapper {
      flex: 1;
      max-height: 100%;
      overflow: auto;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
    }
    ^table {
      position: relative;
    }
    ^table  .foam-u2-view-TableView-thead {
      z-index: 1;
      overflow: visible;
    }
    ^scrolled .foam-u2-view-TableView-thead {
      box-shadow: 0 1.5px 4px $grey300;
    }
    ^nav{
      align-items: center;
      background: $white;
      border-radius: 0 0 4px 4px;
      border-top: 1px solid $grey300;
      box-sizing: border-box;
      gap: 8px;
      justify-content: flex-end;
      max-height: 56px;
      padding: 16px 24px;
      width: 100%;
    }
    ^buttons svg{
      width: 1em;
      height: 1em;
    }
    ^counters > *:focus {
      border: 0px;
      border-radius: 0px;
      padding: 0px;
      height: auto;
      border-bottom: 2px solid $primary400;
    }
    ^counters:hover {
      cursor: pointer;
    }
  `,

  constants: [
    {
      type: 'Float',
      name: 'MIN_TOP_PAGE_PROGRESS',
      documentation: `
        If the "top" page isn't scrolled by at least this amount, make
        the top page the previous page.
        i.e. If the page that's currently in view is only scrolled 10% of the way,
        we consider the page that's above it to be the "top" page. If the page
        that's on screen is scrolled 51% of the way, then it is considered the top
        page.
      `,
      value: 0.5
    },
    {
      type: 'Integer',
      name: 'NUM_PAGES_TO_RENDER',
      value: 3
    },
    {
      type: 'Integer',
      name: 'TABLE_HEAD_HEIGHT',
      value: 48
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    'columns',
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'contextMenuActions'
    },
    {
      class: 'Int',
      name: 'daoCount'
    },
    'selection',
    'disableUserSelection',
    {
      class: 'Boolean',
      name: 'editColumnsEnabled',
      documentation: `
        Set to true if users should be allowed to choose which columns to use.
      `,
      value: true
    },
    {
      class: 'Int',
      name: 'rowHeight',
      documentation: 'The height of one row of the table in px.',
      value: 48
    },
    {
      name: 'table_',
      documentation: `
        A reference to the table element we use in various calculations.
      `
    },
    {
      type: 'Int',
      name: 'scrollHeight',
      expression: function(daoCount, rowHeight) {
        return rowHeight * daoCount + this.TABLE_HEAD_HEIGHT;
      }
    },
    {
      type: 'Int',
      name: 'pageSize',
      value: 30,
      documentation: 'The number of items in each "page". There are three pages.'
    },
    {
      class: 'Boolean',
      name: 'multiSelectEnabled',
      documentation: 'Pass through to UnstyledTableView.'
    },
    {
      class: 'Map',
      name: 'selectedObjects',
      documentation: `
        The objects selected by the user when multi-select support is enabled.
        It's a map where the key is the object id and the value is the object.
        Here we simply bind it to the selectedObjects property on TableView.
      `
    },
    {
      class: 'Int',
      name: 'scrollPos_'
    },
    {
      class: 'Int',
      name: 'numPages_',
      expression: function(daoCount, pageSize) {
        return Math.ceil(daoCount / pageSize);
      }
    },
    {
      class: 'Int',
      name: 'currentTopPage_',
      expression: function(numPages_, scrollPos_, scrollHeight) {
        var scrollPercent = scrollPos_ / scrollHeight;
        var topPage = Math.floor(scrollPercent * numPages_);
        var topPageProgress = (scrollPercent * numPages_) % 1;
        if ( topPageProgress < this.MIN_TOP_PAGE_PROGRESS ) topPage = topPage - 1;
        return Math.min(Math.max(0, numPages_ - this.NUM_PAGES_TO_RENDER), Math.max(0, topPage));
      }
    },
    {
      class: 'Map',
      name: 'renderedPages_'
    },
    {
      class: 'Map',
      name: 'renderedPageSlots_'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      name: 'dblClickListenerAction',
      factory: function() {
        return function(obj, id, title) {
          if ( ! this.stack || this.isDetached() ) return;

          this.stack.push(this.StackBlock.create({
            view: {
              class: 'foam.comics.v2.DAOSummaryView',
              data: obj,
              config: this.config,
              idOfRecord: id
            }, parent: this.__subContext__.createSubContext({ memento: this.table_.memento?.tail })
          }));
        }
      }
    },
    'currentMemento_',
    {
      class: 'Boolean',
      name: 'isInit'
    },
    'tableWrapper_',

    // Navigation props
    {
      class: 'Boolean',
      name: 'showPagination',
      documentation: 'Controls visibility for the pagination elements',
      value: true
    },
    {
      class: 'Int',
      name: 'topRow_',
      documentation: 'Stores the index top row that is currently displayed in the div height',
      preSet: function(o, n) {
        this.scrollTable(this.scrollPos_ + Math.round((n - o) * this.rowHeight));
      },
      expression: function(scrollPos_, rowHeight, daoCount, displayedRowCount_) {
        var possibleMax = daoCount > displayedRowCount_ ? daoCount - displayedRowCount_ + 1 : daoCount;
        return foam.Number.clamp(daoCount ? 1 : 0, Math.round(scrollPos_/rowHeight) + 1, possibleMax);
      }
    },
    {
      class: 'Int',
      name: 'lastDisplayedEl_',
      documentation: 'Stores the index of last row that is currently displayed in the div height',
      preSet: function(o, n) {
        this.scrollTable(this.scrollPos_ + (n - o) * this.rowHeight);
      },
      expression: function(displayedRowCount_, topRow_, daoCount) {
        var possibleMin = daoCount > displayedRowCount_ ? displayedRowCount_ : daoCount;
        return foam.Number.clamp(possibleMin, topRow_ + displayedRowCount_ - 1, daoCount);
      }
    },
    {
      class: 'Float',
      name: 'displayedRowCount_',
      documentation: 'Stores the number of rows that are currently displayed in the div height',
    },
    {
      name: 'lock',
      class: 'FObjectProperty',
      of: 'foam.core.Lock',
      factory: function () {
        return this.Lock.create();
      }
    }
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({fn: this.updateCount})));
      this.onDetach(this.table_$.sub(this.refresh));
      this.onDetach(this.table_$.dot('data').sub(this.refresh));
      this.onDetach(this.table_$.dot('updateValues').sub(this.refresh));
      this.onDetach(this.table_$.dot('order').sub(this.refresh));
      this.updateCount();
    },

    function render() {
      var self = this;
      if ( this.memento ) {
        //as there two settings to configure for table scroll and columns params
        //scroll setting which setts the record to which table currently scrolled
        var m = this.memento;
        for ( var i = 0 ; i < 2 ; i++ ) {
          if ( ! m ) {
            m = foam.nanos.controller.Memento.create({ value: '', parent: this.memento });
            this.memento.tail = m;
          } else {
            if ( ! m.tail )
              m.tail = foam.nanos.controller.Memento.create({ value: '', parent: m });
            m = m.tail;
          }
        }
        this.currentMemento_ = this.memento.tail;
      }

      this.table_ = foam.u2.ViewSpec.createView(this.TableView, {
        data: foam.dao.NullDAO.create({of: this.data.of}),
        refDAO: this.data,
        columns: this.columns,
        contextMenuActions: this.contextMenuActions,
        selection$: this.selection$,
        editColumnsEnabled: this.editColumnsEnabled,
        disableUserSelection: this.disableUserSelection,
        multiSelectEnabled: this.multiSelectEnabled,
        selectedObjects$: this.selectedObjects$
      }, this, this.__subSubContext__.createSubContext({ memento: this.currentMemento_ && this.currentMemento_.tail }));

      if ( ! this.table_.memento || ! this.table_.memento.tail || this.table_.memento.tail.head.length == 0 ) {
        var buttonStyle = { label: '', buttonStyle: 'TERTIARY', size: 'SMALL' };
        this.start(this.Rows).addClass(this.myClass()).
          enableClass(this.myClass('full-height'), this.showPagination$).
          start('div', {}, this.tableWrapper_$).
            call(() => { this.updateRowCount(); }).
            addClass(this.myClass('table-wrapper')).
            on('scroll', this.onScroll).
            start().
              add(this.table_).
              enableClass(this.myClass('scrolled'), this.scrollPos_$).
              addClass(this.myClass('table')).
              style({
                height: this.scrollHeight$.map(h => h + 'px')
              }).
            end().
          end().
          add(this.slot(showPagination => {
            return showPagination ?
             this.E().start(self.Cols).
              addClass(self.myClass('nav')).
              style({ 'justify-content': 'flex-end'}). // Have to do this here because Cols CSS is installed after nav. Investigate later.
              startContext({ data: self }).
                start(self.Cols).
                  style({ gap: '4px', 'box-sizing': 'border-box' }).
                  start(this.ReadWriteView, { data$: self.topRow_$ }).addClass(this.myClass('counters')).end().
                  add('-').
                  start(this.ReadWriteView, { data$: self.lastDisplayedEl_$ }).addClass(this.myClass('counters')).end().
                  start().addClass(self.myClass('separator')).add('of').end().add(self.daoCount$).
                end().
                start(self.FIRST_PAGE, { ...buttonStyle, themeIcon: 'first' }).
                addClass(self.myClass('buttons')).end().
                start(self.PREV_PAGE, { ...buttonStyle, themeIcon: 'back' }).
                addClass(self.myClass('buttons')).end().
                start(self.NEXT_PAGE, { ...buttonStyle, themeIcon: 'next' }).
                addClass(self.myClass('buttons')).end().
                start(self.LAST_PAGE, {  ...buttonStyle, themeIcon: 'last' }).
                addClass(self.myClass('buttons')).end().
              endContext().
              end() : this.E();
          })).
        end();

        // TODO: REPALCE WITH FOAM IMPLMEMENTATION WITH U3
        var resize = new ResizeObserver (self.updateRowCount);
        this.tableWrapper_.sub('onload', () => {
          resize.observe(self.tableWrapper_.el_());
        })
        this.onDetach(resize.disconnect());

      } else if ( this.table_.memento.tail.head.length != 0 ) {
        if ( this.table_.memento.tail.head == 'create' ) {
          this.stack.push(this.StackBlock.create({
            view: {
              class: 'foam.comics.v2.DAOCreateView',
              data: (this.config.factory || this.data.of).create({ mode: 'create'}, this),
              config$: this.config$,
              of: this.data.of
            }, parent: this.__subContext__.createSubContext({ memento: this.table_.memento })
          }));
        } else if ( this.table_.memento.tail.tail && this.table_.memento.tail.tail.head ) {
          var id = this.table_.memento.tail.tail.head;
          if ( ! foam.core.MultiPartID.isInstance(this.data.of.ID) ) {
            id = this.data.of.ID.fromString(id);
          } else {
            id = this.data.of.ID.of.create();
            mementoHead = '{' + this.table_.memento.tail.tail.head.replaceAll('=', ':') + '}';
            var idFromJSON = foam.json.parseString(mementoHead);
            for ( var key in idFromJSON ) {
              var axiom = this.data.of.getAxiomByName(key);

              if ( axiom )
                axiom.set(id, idFromJSON[key]);
            }
          }
          this.config.dao.inX(ctrl.__subContext__).find(id).then(v => {
            if ( ! v ) return;
            if ( self.state != self.LOADED ) return;
            this.stack.push(this.StackBlock.create({
              view: {
                class: 'foam.comics.v2.DAOSummaryView',
                data: null,
                config: this.config,
                idOfRecord: id
              }, parent: this.__subContext__.createSubContext({ memento: this.table_.memento.tail })
            }));
          });
        }
      }
    },
    function scrollTable(scroll) {
      if ( this.childNodes && this.childNodes.length > 0 )
        this.getElementById(this.tableWrapper_.id).scrollTop = scroll;
    }
  ],

  listeners: [
    {
      name: 'reconnectPages',
      code: function () {
        Object.keys(this.renderedPageSlots_).forEach(page => {
          this.renderedPages_[page] = this.table_.slotE_(this.renderedPageSlots_[page]);
        });
      }
    },
    {
      name: 'refresh',
      isFramed: true,
      code: async function() {
        this.reconnectPages();
        Object.keys(this.renderedPages_).forEach(i => {
          this.renderedPages_[i].remove();
          this.renderedPageSlots_[i].detach();
          delete this.renderedPageSlots_[i];
          delete this.renderedPages_[i];
        });
        this.updateRenderedPages_();
        var el = await this.el();
        if ( ! this.isInit && this.currentMemento_ && this.currentMemento_.head.length != 0 ) {
          var scroll = this.currentMemento_.head * this.rowHeight;
          scroll = scroll >= this.rowHeight && scroll < this.scrollHeight ? scroll : 0;

          this.scrollTable(scroll);

          this.isInit = true;
        } else {
          el.scrollTop = 0;
        }
      }
    },
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        var limit = ( this.data && this.data.limit_ ) || undefined;
        return this.lock.then(() => {
          return new Promise((resolve) =>{
            this.data$proxy.select(this.COUNT()).then((s) => {
              this.daoCount = limit && limit < s.value ? limit : s.value;
              this.refresh();
              resolve();
            })
          })
        })
      }
    },
    {
      name: 'updateRenderedPages_',
      isFramed: true,
      on: [
        'this.propertyChange.currentTopPage_'
      ],
      code: function() {
        if ( ! this.table_ ) return;

        // Remove any pages that are no longer on screen to save on
        // the amount of DOM we add to the page.
        Object.keys(this.renderedPages_).forEach(i => {
          if ( i >= this.currentTopPage_ && i < this.currentTopPage_ + this.NUM_PAGES_TO_RENDER ) return;
          this.renderedPages_[i].remove();
          this.renderedPageSlots_[i].detach();
          delete this.renderedPageSlots_[i];
          delete this.renderedPages_[i];
        });

        // Add any pages that are not already rendered.
        for ( var i = 0; i < Math.min(this.numPages_, this.NUM_PAGES_TO_RENDER) ; i++) {
          var page = this.currentTopPage_ + i;
          if ( this.renderedPages_[page] ) continue;
          var dao   = this.data$proxy.limit(this.pageSize).skip(page * this.pageSize);
          this.renderedPageSlots_[page] = this.table_.rowsFrom(dao, this.TABLE_HEAD_HEIGHT + page * this.pageSize * this.rowHeight)
          var tbody = this.table_.slotE_(this.renderedPageSlots_[page]);
          this.table_.add(tbody);
          this.renderedPages_[page] = tbody;
        }
      }
    },
    {
      name: 'onScroll',
      isFramed: true,
      code: function(e) {
        this.scrollPos_ = e.target.scrollTop;
        if ( this.currentMemento_ ) {
          this.currentMemento_.head = this.scrollPos_ >= this.rowHeight && this.scrollPos_ < this.scrollHeight ? Math.floor( this.scrollPos_  / this.rowHeight) : 0;
        }
      }
    },
    function dblclick(obj, id, title) {
      this.dblClickListenerAction(obj, id, title);
    },
    // Navigation
    {
      name: 'updateRowCount',
      isframed: true,
      code: function() {
        this.tableWrapper_.el().then(e => {
          var displayHeight = e.getBoundingClientRect().height;
          this.displayedRowCount_ = Math.round((displayHeight - this.TABLE_HEAD_HEIGHT)/this.rowHeight);
        });
      }
    }
  ],

  actions: [
    {
      name: 'nextPage',
      toolTip: 'Next Page',
      isEnabled: function(lastDisplayedEl_, daoCount) {
        return lastDisplayedEl_ != daoCount;
      },
      code: function() {
        if ( this.displayedRowCount_ ) {
          var scroll = this.scrollPos_ + (this.displayedRowCount_*this.rowHeight);
          this.scrollTable(scroll);
        }
      }
    },
    {
      name: 'lastPage',
      toolTip: 'Last Page',
      isEnabled: function(lastDisplayedEl_, daoCount) {
        return lastDisplayedEl_ != daoCount;
      },
      code: function() {
        if ( this.displayedRowCount_ ) {
          this.scrollTable(this.scrollHeight);
        }
      }
    },
    {
      name: 'prevPage',
      toolTip: 'Previous Page',
      isEnabled: function(topRow_) {
        return topRow_ > 1;
      },
      code: function() {
        if ( this.displayedRowCount_ ) {
          var scroll = this.scrollPos_ - (this.displayedRowCount_*this.rowHeight);
          this.scrollTable(scroll);
        }
      }
    },
    {
      name: 'firstPage',
      toolTip: 'First Page',
      isEnabled: function(topRow_) {
        return topRow_ > 1;
      },
      code: function() {
        this.scrollTable(0);
      }
    }
  ]
});
