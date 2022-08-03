/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'SearchBar',
  extends: 'foam.u2.Element',

  documentation: `
    A search textfield which returns the input text as data to filter by
  `,

  css: `
    ^search .property-filter_ {
      width: 100%;
    }

    ^search input {
      border-bottom: none;

      width: 100%;
      border: none;
      padding-left: /*%INPUTHORIZONTALPADDING%*/ 8px;
      padding-right: /*%INPUTHORIZONTALPADDING%*/ 8px;
      height: /*%INPUTHEIGHT%*/ 34px;
    }

    ^search img {
      top: 8px;
      width: 15px;
      margin-left: 8px;
    }

    ^search {
      border-bottom: 1px solid #f4f4f9;
      display: flex;
      padding: 8px 16px;
    }
  `,

  messages: [
    { name: 'DEFAULT_PLACEHOLDER', message: 'Search ...' }
  ],

  properties: [
    {
      class: 'String',
      name: 'placeholderText',
      factory: function() {
        return this.DEFAULT_PLACEHOLDER;
      }
    },
    {
      class: 'String',
      name: 'data'
    }
  ],

  methods: [
    function render() {
      var self = this;
      this
        .start()
          .addClass(self.myClass('search'))
          .start('img')
            .attrs({ src: 'images/ic-search.svg' })
          .end()
          .startContext({ data: self })
            .start({
              class: 'foam.u2.view.TextField',
              placeholder: self.placeholderText,
              onKey: true,
              data$: self.data$
            })
            .end()
          .endContext()
        .end();
    }
  ]
});
