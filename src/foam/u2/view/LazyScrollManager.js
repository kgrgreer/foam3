/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'LazyScrollManager',
  extends: 'foam.u2.View',
  mixins: [ 'foam.u2.memento.Memorable' ],

  documentation: 'A configurable scroll manager that dynamically lazy loads dao data',

  requires: [
    'foam.dao.FnSink',
    'foam.core.Latch',
    'foam.dao.ProxyDAO',
    'foam.mlang.sink.Count',
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
      // Used to prevent extra large datasets being requested as it caused chrome to crash
      max: 1000,
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
      class: 'Map',
      name: 'loadingPages_',
      documentation: 'Used to ensure pages that are currently being loaded are not reloaded/duplicated'
    },
    {
      class: 'Int',
      name: 'topRow',
      memorable: true,
      documentation: 'Stores the index top row that is currently displayed in the table',
      postSet: function(o, n) {
        if ( this.scrollToIndex || o == n ) return;
        var n1 = (n-(this.currentTopPage_*this.pageSize))/this.pageSize;
        if ( n < o && n1 <= 1 && n1 < 1 - this.MIN_PAGE_PROGRESS ) {
          this.currentTopPage_ --;
        }
      }
    },
    {
      class: 'Int',
      name: 'bottomRow',
      documentation: 'Stores the index of last row that is currently displayed in the table',
      postSet: function(o, n) {
        if ( this.scrollToIndex || o == n ) return;
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
      class: 'Int',
      name: 'scrollToIndex',
      postSet: function () { this.safeScroll(); }
    },
    'currGroup_',
    'rowObserver',
    {
      name: 'rootElement',
      documentation: 'FOAM element that is used as the observation bounds for intersectionManager'
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
      documentation: 'A context variable that is passed to the prepDAO function'
    },
    {
      class: 'Function',
      name:'prepDAO',
      documentation: `Function that is run before each page is loaded on a limited DAO,
      should always return a promise, can be used to create projections`
    },
    {
      name: 'appendTo',
      factory: function() { return this.parentNode; },
      documentation: 'FOAM element that the ScrollManager adds rows to. Defaults to parentNode to avoid layout shifts'
    },
    {
      class: 'Int',
      name: 'offsetTop',
      value: 0,
      documentation: 'Offset property that is passed to IntersectionObserver'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Latch',
      name: 'dataLatch',
      documentation: 'A latch used to wait for table data load.',
      factory: function () {
        return this.Latch.create();
      }
    },
    ['isInit', true]
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
      var self = this;
      var resize = new ResizeObserver (this.checkPageSize_);
      let options = {
        root: this.rootElement?.el_() ?? null,
        rootMargin: `-${this.offsetTop}px 0px 0px`,
        threshold: [0.25, 0.5, 0.75]
      };

      // defer till after atleast one page has been loaded in order
      // to ensure correct value for displayedRowCount_
      this.dataLatch.then(() => {
        this.rootElement?.el().then(el => {
          resize.observe(el);
        })
      })

      this.rowObserver = new IntersectionObserver(handleIntersect, options);
      // This needs to be here because intersectionObserver does not bind the correct this during callback
      function handleIntersect(entries, observer) {
        self.onRowIntersect(entries, self);
      }
      this.onDetach(resize.disconnect);
      this.onDetach(this.rowObserver.disconnect);
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
      if ( ! this.scrollToIndex ) return;
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
      this.loadingPages_[page] = true;
      promise = this.prepDAO(proxy, this.ctx);
      var e = this.E().attr('data-page', page);

      promise.then((values) => {
        if ( foam.mlang.sink.Projection.isInstance( values ) ) {
          for (var i = 0 ; i < values.projection.length ; i++) {
            if ( values.array[i] === undefined ) continue;
            var index = (page*this.pageSize) + i + 1;
            if ( this.groupBy ) {
              var group = self.groupBy.f(values.array[i]);
              if ( ! foam.util.equals(group, self.currGroup_) || index == 1 ) {
                e.tag(self.groupHeaderView, { obj: values.array[i], projection: values.projection[i] });
              }
              self.currGroup_ = group;
            }
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
        if  ( self.renderedPages_[page] ) {
          console.warn('Trying to overwrite a loaded page without clearning....Clearing page');
          this.clearPage(page)
        }
        Object.keys(self.renderedPages_).forEach(j => {
          if ( j > page && self.renderedPages_[j] && !isSet ){
            this.appendTo.insertBefore(e, self.renderedPages_[j]);
            isSet = true;
            // TODO: Figure out why scrolling to the top causes you to go to first page
          }
        });
        if ( ! isSet ) { this.appendTo.add(e); isSet = true; }
        self.renderedPages_[page] = e;
        self.loadingPages_[page] = false;
        // If there is a scroll in progress and all pages have been loaded, try to scroll again
        if ( this.scrollToIndex && Object.keys(this.renderedPages_).length == Math.min(this.NUM_PAGES_TO_RENDER, this.numPages_) )
          self.safeScroll();
        this.dataLatch.resolve();
        if ( this.displayedRowCount_ < 0 ) this.bottomRow = this.daoCount
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
        this.currGroup_ = undefined;
        this.rowObserver?.disconnect();
        // Don't clear loadingPages_ here since they are being
        // loaded and will have latest data anyway
        Object.keys(this.renderedPages_).forEach(i => {
          this.clearPage(i, true);
        });
        if ( ! this.isInit ) {
          this.currentTopPage_ = 0;
          this.topRow = 0;
          this.bottomRow = 0;
        }
        this.isInit = false;
        this.updateRenderedPages_();
        if ( this.topRow > 1) {
          this.scrollToIndex = this.topRow;
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
        for ( var i = 0; i < Math.min(this.numPages_, this.NUM_PAGES_TO_RENDER) ; i++ ) {
          var page = this.currentTopPage_ + i;
          if ( this.renderedPages_[page] || this.loadingPages_[page] ) continue;
          var skip = page * this.pageSize;
          var dao  = this.data.limit(this.pageSize).skip(skip);
          this.getPage(dao, page);
        }
      }
    },
    {
      name: 'onRowIntersect',
      isFramed: true,
      code: function(entries, self){
        entries.forEach((entry) => {
          if ( entry.intersectionRatio == 0 ) return;
          var index = Number(entry.target.dataset.idx);
          if ( entry.boundingClientRect.top <= entry.rootBounds.top ) {
            if ( entry.boundingClientRect.top + (entry.boundingClientRect.height/2) <= entry.rootBounds.top )
              index += 1;

            self.topRow = index;
          } else if( entry.boundingClientRect.bottom >= entry.rootBounds.bottom ) {
            if ( entry.boundingClientRect.top + (entry.boundingClientRect.height/2) >= entry.rootBounds.bottom )
              index -= 1;

            if ( index > 0 )
              self.bottomRow = index;
          }
        });

        if ( ! self.bottomRow && self.displayedRowCount_ < 0 )
          self.bottomRow = self.pageSize > entries.length ? entries.length : self.pageSize;
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
