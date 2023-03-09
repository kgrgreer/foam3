/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'ClockClient',

  imports: [ 'c3' ],

  methods: [
    function init() {
      this.c3.add(foam.demos.clock.Clock.create({}, this));
      console.log(new Date());
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'C3',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.boot.NSpec'
  ],

  exports: [
    'as c3'
  ],

  properties: [
    {
      name: 'client'
    },
    {
      name: 'extraServices',
      class: 'FObjectArray',
      of: 'foam.nanos.boot.NSpec',
      factory: function() { return [
        {
          name: 'clock',
          lazyClient: false,
          client: `{ "class": "foam.nanos.c3.ClockClient" }`
        }
      ]; }
    }
  ],

  methods: [
    async function ainit() {
      var cb       = this.ClientBuilder.create({extraServices: this.extraServices});
      var Client   = await cb.promise;
      this.client  = Client.create(null, this);
      globalThis.x = this.client.__subContext__;
      this.br().add('Client Created').br();

//      this.client.EAGER_CLIENTS_.forEach(s => this.startService(s));
      cb.nSpecDAO.where(this.EQ(this.NSpec.LAZY_CLIENT, false)).select(s => this.startService(s));
  //    this.extraServices.forEach(s => this.startService(this.NSpec.create(s)));
    },

    function startService(s) {
      this.add('service: ', s.name).br();
      this.client.__subContext__[s.name];
    },

    function render() {
      this.add('C3').br();
      this.ainit();
    }
  ]
});
