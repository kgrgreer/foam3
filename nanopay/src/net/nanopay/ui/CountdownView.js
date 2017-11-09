foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'CountdownView',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 78px;
          height: 20px;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #2cab70;
        }

        ^.hidden {
          display: none;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Long',
      name: 'duration',
      value: 30 * 60 * 1000
    },
    {
      class: 'DateTime',
      name: 'time',
      factory: function () {
        var date = new Date(null);
        date.setMilliseconds(this.duration);
        return date;
      }
    },
    {
      class: 'Boolean',
      name: 'isStopped',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isHidden',
      value: false
    },
    {
      class: 'Function',
      name: 'onExpiry'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .add(this.time$.map(function (value) {
          return value.toISOString().substr(11, 8);
        }));
    },

    function start() {
      this.isStopped = false;
      this.tick();
    },

    function stop() {
      this.isStopped = true;
    },

    function reset() {
      this.stop();
      this.duration = 30 * 60 * 1000;
      this.time = new Date(null).setMilliseconds(this.duration);
    },

    function hide() {
      this.isHidden = true;
    },

    function show() {
      this.isHidden = false;
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function () {
        if ( this.isStopped ) return;
        if ( this.duration <= 1000 ) {
          this.duration = 0;
          this.time = 0;
          this.onExpiry();
          return;
        }
        this.duration -= 1000;
        this.time -= 1000;
        this.tick();
      }
    }
  ]
});
