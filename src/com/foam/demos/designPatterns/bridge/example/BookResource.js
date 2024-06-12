/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.bridge.example',
  name: 'BookResource',
  implements: [ 'foam.demos.designPatterns.bridge.example.Resource' ],

  properties: [
    {
      type: 'foam.demos.designPatterns.bridge.example.Book',
      name: 'book',
    }
  ],

  methods: [
    function init(book) {
      this.SUPER(book);
      //this.book = book;
    },
    function snippet() {
      return this.book.getText();
    },
    function image() {
      return null;
    },
    function title() {
      return this.book.getTitle();
    }
  ]
});
