/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.address',
  name: 'AddressAutocompleter',
  extends: 'foam.u2.Autocompleter',

  imports: [
    'placeService?',
    'currentCountry'
  ],

  messages: [
    // TODO: replace message
    { name: 'MIN_CHARS',   message: 'Enter atleast 3 characters to get suggestions' },
    { name: 'NO_SERVICE',   message: 'No place service found' }
  ],

  properties: [
    'filtered',
    'error'
  ],

  methods: [
    function init() {
      if ( ! this.placeService ) 
        this.error = this.NO_SERVICE;
      this.SUPER();
    }
  ],

  listeners: [
    {
      name: 'onUpdate',
      code: function() {
        if ( this.partial.length < 3 ) { 
          this.error = this.MIN_CHARS;
          return;
        }
        this.filtered = [];
        this.loading = true;
        this.callService_();
      }
    },
    {
      name: 'callService_',
      isIdled: true,
      delay: 300,
      code: async function() {
        this.error = null;
        let fn = this.placeService?.placeAutocomplete.bind(this.placeService)
        this.filtered = (await foam.events.discardStale(fn)(null, this.partial, this.currentCountry))?.predictions;
        this.loading = false;
      }
    }
  ]
});