/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.bridge.example',
  name: 'Artist',

  properties: [
    {
      type: 'String',
      name: 'bio',
    },
    {
      type: 'String',
      name: 'name',
    }
  ],

  methods: [
    function bio() {
      return this.bio;
    },

    function name() {
      return this.name;
    },

    function init( name,  bio) {
      this.SUPER(name, bio);
      // this.bio = bio;
      // this.name = name;
    }
  ]
});
