foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'CountdownView',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 78px;
          height: 20px;
        }
        ^ .countdown {
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
      class: 'String',
      name: 'timestamp'
    },
    {
      class: 'DateTime',
      name: 'time',
      factory: function () {
        var date = new Date(null);
        date.setMilliseconds(this.duration);
        return date;
      },
      postSet: function (_, value) {
        this.timestamp = value.toISOString().substr(11, 8);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('countdown')
          .add(this.timestamp$)
        .end();

      this.onload.sub(function () {
        self.tick();
      })
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function () {
        // TODO: notify of countdown finished
        if ( this.duration <= 0 )
          return;
        this.duration -= 1000;
        this.time -= 1000;
        this.tick();
      }
    }
  ]
});