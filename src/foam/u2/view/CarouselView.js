/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CarouselView',
  extends: 'foam.u2.View',
  documentation: '',
  css: `
    ^ {
      display: flex;
      gap: 1.2rem;
      width: 100%;
    }
    ^slides {
      display: flex;
      gap: 2.4rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      
      width: max-content;
      
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    ^slides::-webkit-scrollbar {
      width: 0;
    }
    ^slides > div {
      scroll-snap-align: center;
      flex-shrink: 0;
      width: 100%;
      transform-origin: center center;
      transform: scale(1);
      transition: transform 0.5s;
      position: relative;
      
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'data'
    },
    // TODO: Imeplement this feture
    {
      class: 'Int',
      name: 'autoMoveDelay',
      documentation: 'When set, the carousel automoves to the next slide after defined time in ms unless the user is hovering over the view'
    },
    ['currentIndex_', 0],
    ['idArray_', []]
  ],

  methods: [
    function render() {
      // implement scroll into view
      this.data$.sub(() => { this.idArray_= []; });
      this.currentIndex_$.sub(this.scrollIntoView);
      var self = this;
      this.addClass()
        .style({ 'justify-content': this.data$.map(v => v.length > 1 ? 'space-between' : 'center') })
        .startContext({ data: this })
        .tag(this.BACK)
        .forEach(this.data$, function(obj, idx) {
          var id = 'u' + obj.$UID;
          self.idArray_.push(id);
          this
            .addClass(self.myClass('slides'))
            .start({ class: 'foam.u2.CitationView', of: obj?.cls_, data: obj, id: id})
              .addClass(self.myClass('slide'))
            .end();
        })
        .tag(this.NEXT)
        .endContext()
    }
  ],

  listeners: [
    function scrollIntoView() {
      let el = document.getElementById(this.idArray_[this.currentIndex_]);
      if ( !  el ) return;

      el.scrollIntoView(false);
    }
  ],

  actions: [
    {
      name: 'next',
      label: '',
      themeIcon: 'next',
      buttonStyle: 'TERTIARY',
      isAvailable: function(data) { return data.length > 1; },
      code: function() {
        if ( this.currentIndex_ == this.data.length - 1 ) {
          this.currentIndex_ = 0;
        } else {
          this.currentIndex_++;
        }
      }
    },
    {
      name: 'back',
      label: '',
      themeIcon: 'back',
      buttonStyle: 'TERTIARY',
      isAvailable: function(data) { return data.length > 1; },
      code: function() {
        if ( this.currentIndex_ == 0 ) {
          this.currentIndex_ = this.data.length - 1;
        } else {
          this.currentIndex_--;
        }
      }
    }
  ]

});