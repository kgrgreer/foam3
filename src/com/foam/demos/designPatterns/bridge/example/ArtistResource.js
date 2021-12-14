/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.bridge.example',
  name: 'ArtistResource',

  properties: [
    {
      of: 'foam.demos.designPatterns.bridge.example.Artist',
      name: 'artist',
    }
  ],

  methods: [
    function init(artist) {
      this.SUPER(artist);
      //this.artist = artist;
    },
    function snippet() {
      return this.artist.bio();
    },
    function image() {
      return null;
    },
    function title() {
      return this.artist.name();
    }
  ]
});
