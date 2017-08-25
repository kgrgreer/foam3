foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'CountdownView',
  extends: 'foam.u2.View',

  imports: [
    'onExpiry'
  ],

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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .add(this.time$.map(function (value) {
          return value.toISOString().substr(11, 8);
        }))

      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function () {
        if ( this.duration <= 0 ) {
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