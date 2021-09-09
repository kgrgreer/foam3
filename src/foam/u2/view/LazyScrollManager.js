/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'LazyScrollManager',
  extends: 'foam.u2.View',
  mixins: ['foam.nanos.controller.MementoMixin'],

  documentation: 'A configurable scroll manager that dynamically lazy loads dao data',

  requires: [
    'foam.dao.FnSink',
    'foam.mlang.sink.Count',
    'foam.nanos.controller.Memento',
    'foam.dao.ProxyDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  constants: [
    {
      type: 'Float',
      name: 'MIN_PAGE_PROGRESS',
      documentation: `
       If the top or bottom page is scrolled by this amount update the currentTopPage_ accordingly
      `,
      value: 0.5
    },
    {
      type: 'Integer',
      name: 'NUM_PAGES_TO_RENDER',
      value: 3
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'Int',
      name: 'daoCount'
    },
    {
      type: 'Int',
      name: 'pageSize',
      value: 30,
      documentation: 'The number of items in each "page". There are three pages.'
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
      factory: function() { return 0; },
      preSet: function(o, n) {
        return foam.Number.clamp(0, n, this.numPages_ - this.NUM_PAGES_TO_RENDER );
      }
    },
    {
      class: 'Map',
      name: 'renderedPages_'
    },
    {
      class: 'Int',
      name: 'topRow',
      documentation: 'Stores the index top row that is currently displayed in the table',
      postSet: function(o, n) {
        if ( this.scrollToIndex != undefined || o == n ) return;
        var n1 = (n-(this.currentTopPage_*this.pageSize))/this.pageSize;
        if ( n < o && n1 <= 1 && n1 < 1 - this.MIN_PAGE_PROGRESS ) {
          this.currentTopPage_ --;
        }
        if ( this.memento ) {
          this.memento.head = this.topRow || 0;
        }
      }
    },
    {
      class: 'Int',
      name: 'bottomRow',
      documentation: 'Stores the index of last row that is currently displayed in the table',
      postSet: function(o, n) {
        if ( this.scrollToIndex != undefined || o == n ) return;
        var n1 = (n-(this.currentTopPage_*this.pageSize))/this.pageSize;
        if ( n > o && n1 >= this.NUM_PAGES_TO_RENDER - 1 && n1%1 > this.MIN_PAGE_PROGRESS ) {
          this.currentTopPage_ ++;
        }
      }
    },
    {
      class: 'Float',
      name: 'displayedRowCount_',
      documentation: 'Stores the number of rows that are currently displayed in the div height',
      expression: function(topRow, bottomRow) {
        return bottomRow - topRow;
      }
    },
    { 
      name: 'scrollToIndex',
      postSet: function () { this.safeScroll(); }
    },
    'currGroup_',
    'rowObserver',
    { 
      name: 'rootElement',
      documentation: ''
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'groupHeaderView'
    },
    {
      class: 'FObjectProperty',
      name: 'groupBy',
      documentation: 'An expression which returns the group title. Can be a Property.'
    },
    {
      class: 'FObjectProperty',
      name: 'order',
      documentation: 'Optional order used to sort citations within a group'
    },
    { 
      name: 'ctx',
      documentation: ''
    },
    { 
      class: 'Function',
      name:'prepDAO',
      documentation: ''
    },
    { 
      name: 'appendTo',
      factory: function() { return this.parentNode; },
      documentation: ''
    },
    {
      class: 'Int',
      name: 'offsetTop',
      value: 0,
      documentation: ''
    }
  ],

  reactions: [
    ['', 'propertyChange.currentTopPage_', 'updateRenderedPages_']
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.updateCount })));
      this.updateCount();
    },

    function render() {
      this.data = foam.dao.QueryCachingDAODecorator.create({ delegate: this.data });
      this.initMemento();
      var self = this;
      var resize = new ResizeObserver (this.checkPageSize_);
      let options = {
        root: this.rootElement?.el_() ?? null,
        rootMargin: `-${this.offsetTop}px 0px 0px`,
        threshold: [0.05, 0.5, 0.95]
      };
      resize.observe(this.rootElement?.el_());
      this.rowObserver = new IntersectionObserver(handleIntersect, options);
      // This needs to be here because intersectionObserver does not bind the correct this during callback
      function handleIntersect(entries, observer) {
        self.onRowIntersect(entries, self);
      }

      this.onDetach(this.rootElement$.sub(this.updateRenderedPages_));
      this.onDetach(this.order$.sub(this.refresh));
      this.onDetach(this.groupBy$.sub(this.refresh));
    },

    function scrollView(scroll) {
      if ( this.rootElement.el_() )
        this.rootElement.el_().scrollTop = scroll - this.offsetTop;
      this.scrollToIndex = undefined;
    },

    function safeScroll(){
      if ( this.scrollToIndex == undefined ) return;
      var page = Math.floor(this.scrollToIndex/this.pageSize);
      if ( this.renderedPages_[page] ) {
        var el = document.querySelector(`[data-idx='${this.scrollToIndex}']`);
        if ( ! el ) return;
        this.scrollView(el.offsetTop);
      } else {
        if ( page == 0 && this.currentTopPage_ != 0 ) {
          this.currentTopPage_ = 0;
          return;
        } else if ( page == this.numPages_ - 1 && this.currentTopPage_ != this.numPages_ - this.NUM_PAGES_TO_RENDER ) {
          this.currentTopPage_ = this.numPages_ - this.NUM_PAGES_TO_RENDER;
          return;
        } else if ( page != this.currentTopPage_ + 1 ) {
          this.currentTopPage_ = page - 1;
          return;
        } 
      }
    },

    function clearPage(page, opt_skipObserver) {
      ! opt_skipObserver && this.renderedPages_[page].childNodes?.forEach((e) => {
        if ( e.el_() )
          this.rowObserver.unobserve(e.el_());
      })
      this.renderedPages_[page].remove();
      delete this.renderedPages_[page];
    },

    function getPage(dao, page) {
      var self = this;
      var proxy = this.ProxyDAO.create({ delegate: dao });
      var sortParams = [];
      if ( this.groupBy ) sortParams.push(this.groupBy)
      if ( this.order ) sortParams.push(this.order)
      if ( sortParams.length ) proxy = proxy.orderBy(sortParams); 
      promise = this.prepDAO(proxy, this.ctx);
      var e = this.E();

      promise.then((values) => {
        if ( foam.mlang.sink.Projection.isInstance( values ) ) {
          for (var i = 0 ; i < values.projection.length ; i++) {
            if ( values.array[i] === undefined ) continue;
            if ( this.groupBy ) {
              var group = self.groupBy.f(values.array[i]);
              if ( group != self.currGroup_ ){
                e.tag(self.groupHeaderView, { obj: values.array[i], projection: values.projection[i] });
              }
              self.currGroup_ = group;
            }
            var index = (page*this.pageSize) + i + 1
            var rowEl = this.E().tag(self.rowView, { obj: values.array[i], projection: values.projection[i] })
                .attr('data-idx', index);
            e.add(rowEl)
            rowEl.el().then((a) => {
              self.rowObserver.observe(a)
            });
          }
        } else if ( foam.dao.DAO.isInstance( values ) ){
          // TODO
        }
        var isSet = false;
        Object.keys(self.renderedPages_).forEach(j => {
          if ( j > page && self.renderedPages_[j] && !isSet ){
            this.appendTo.insertBefore(e, self.renderedPages_[j]);
            isSet = true;
            // TODO: Figure out why scrolling to the top causes you to go to first page
          }
        });
        if ( ! isSet ) { this.appendTo.add(e); isSet = true; }
        self.renderedPages_[page] = e;
        // If there is a scroll in progress and all pages have been loaded, try to scroll again
        if ( this.scrollToIndex != undefined && Object.keys(this.renderedPages_).length == Math.min(this.NUM_PAGES_TO_RENDER, this.numPages_) ) 
          self.safeScroll();
        if ( this.displayedRowCount_ <= 0 ) this.bottomRow = this.daoCount
      });
    }
  ],

  listeners: [
    {
      name: 'checkPageSize_',
      isFramed: true,
      documentation: 'Ensure page size is always atleast as large as the displayedRowCount_',
      code: function () {
        if (this.displayedRowCount_ > this.pageSize) {
          this.pageSize = this.displayedRowCount_;
          this.refresh();
        }
      }
    },
    {
      name: 'refresh',
      isFramed: true,
      code: function() {
        this.rowObserver?.disconnect();
        Object.keys(this.renderedPages_).forEach(i => {
          this.clearPage(i, true);
        });
        this.currentTopPage_ = 0;
        this.updateRenderedPages_();
        if ( ! this.memento ) return;
        if ( this.memento.head.length != 0 ) {
          this.scrollToIndex = this.memento.head;
        } else {
          this.scrollToIndex = 1;
        }
      }
    },
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        var limit = ( this.data && this.data.limit_ ) || undefined;
        return this.data$proxy.select(this.Count.create()).then(s => {
          this.daoCount = limit && limit < s.value ? limit : s.value;
          this.refresh();
        });
      }
    },
    {
      name: 'updateRenderedPages_',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        // Remove any pages that are no longer on screen to save on
        // the amount of DOM we add to the page.
        Object.keys(this.renderedPages_).forEach(i => {
          if ( (i >= this.currentTopPage_ ) && i < this.currentTopPage_ + this.NUM_PAGES_TO_RENDER ) return;
          this.clearPage(i);
        });

        // Add any pages that are not already rendered.
        for ( var i = 0; i < Math.min(this.numPages_, this.NUM_PAGES_TO_RENDER) ; i++) {
          var page = this.currentTopPage_ + i;
          if ( this.renderedPages_[page] ) continue;
          var skip = page * this.pageSize;
          var dao   = this.data.limit(this.pageSize).skip(skip);
          this.getPage(dao, page);
        }
      }
    },
    {
      name: 'onRowIntersect',
      code: function(entries, self){
        entries.forEach((entry) => {
          if ( entry.intersectionRatio == 0 ) return;
          var index = entry.target.dataset.idx;
          if ( entry.boundingClientRect.top <= entry.rootBounds.top ) {
            self.topRow = index;
          } else if( entry.boundingClientRect.top > entry.rootBounds.top ) {
            self.bottomRow = index;
          }
        });
      }
    }
  ],

  actions: [
    // All of these can be used by views that use this view for navigation
    {
      name: 'nextPage',
      toolTip: 'Next Page',
      isEnabled: function(bottomRow, daoCount) {
        return bottomRow != daoCount;
      },
      code: function() {
        var n = foam.Number.clamp(1,this.topRow + this.displayedRowCount_ + 1,this.daoCount);
        this.scrollToIndex = n;
      }
    },
    {
      name: 'lastPage',
      toolTip: 'Last Page',
      isEnabled: function(bottomRow, daoCount) {
        return bottomRow != daoCount;
      },
      code: function() {
        this.scrollToIndex = this.daoCount;
      }
    },
    {
      name: 'prevPage',
      toolTip: 'Previous Page',
      isEnabled: function(topRow) {
        return topRow > 1;
      },
      code: function() {
        var n = foam.Number.clamp(1,this.topRow - this.displayedRowCount_, this.daoCount);
        this.scrollToIndex = n;
      }
    },
    {
      name: 'firstPage',
      toolTip: 'First Page',
      isEnabled: function(topRow) {
        return topRow > 1;
      },
      code: function() {
        this.scrollToIndex = 1;
      }
    }
  ]
});
