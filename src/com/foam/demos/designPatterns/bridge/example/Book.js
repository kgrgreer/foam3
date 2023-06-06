/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.bridge.example',
  name: 'Book',

  properties: [//TODO add private
    {
      type: 'String',
      name: 'title',
    },
    {
      type: 'String',
      name: 'text',
    }
  ],

  methods: [
    function init(title, text) {
      this.SUPER(title, text);
      // this.title = title;
      // this.text = text;
    },
    function getTitle() {
      return title;
    },
    function setTitle( title) {
      this.title = title;
    },
    function getText() {
      return text;
    },
    function setText( text) {
      this.text = text;
    }
  ]
});
