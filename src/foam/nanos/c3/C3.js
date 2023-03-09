/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'ApplicationBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ { background: gray; padding: 10px; display: inline-block; }
    ^title { padding: 6px; align-content: center; background: aliceblue; }
    ^footer { padding: 6px; align-content: left; background:$white; }
    ^content { padding: 6px; width: 300px; height: 300px; background:$white; }
  `,

  properties: [
    'title',
    'footer'
  ],

  methods: [
    function ainit() {
      this.write(document);
    },
    function render() {
      this.
        start().
          addClass(this.myClass()).
          start('div', {}, this.title$).addClass(this.myClass('title')).end().
          start('div', null, this.content$).
            addClass(this.myClass('content')).
          end().
          tag('hr').
          start('div', {}, this.footer$)
            .addClass(this.myClass('footer'))
          .end().
        end();
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'ClockClient',

  imports: [ 'applicationBorder' ],

  methods: [
    function ainit() {
      // this.applicationBorder.content.add('Clock');
      this.applicationBorder.content.add(foam.demos.clock.Clock.create({}, this));
      console.log(new Date());
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'Header',

  imports: [ 'applicationBorder' ],

  methods: [
    function ainit() {
      this.applicationBorder.title.add('Application Header');
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'Footer',

  imports: [ 'applicationBorder' ],

  methods: [
    function ainit() {
      this.applicationBorder.footer.add('Copyright Blah Blah Blah');
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
          name: 'applicationBorder',
          lazyClient: false,
          client: `{ "class": "foam.nanos.c3.ApplicationBorder" }`
        },
        {
          name: 'header',
          lazyClient: false,
          client: `{ "class": "foam.nanos.c3.Header" }`
        },
        {
          name: 'footer',
          lazyClient: false,
          client: `{ "class": "foam.nanos.c3.Footer" }`
        },
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
      this.extraServices.forEach(s => this.startService(this.NSpec.create(s)));
    },

    function startService(s) {
      console.log('service: ', s.name);
      this.add('service: ', s.name).br();
      var s = this.client.__subContext__[s.name];
      s.ainit && s.ainit();
    },

    function render() {
      this.add('C3').br();
      this.ainit();
    }
  ]
});
