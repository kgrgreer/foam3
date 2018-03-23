foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardOverview',
  extends: 'foam.u2.View',

  documentation: 'A view that displays the position of the user in the WizardView Stack.',

  imports: [
    'viewData',
    'complete'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .guideColumn {
          display: inline-block;
          vertical-align: top;
          margin-right: 10px;
        }

        ^ .titleColumn {
          display: inline-block;
          width: 75%;
          vertical-align: top;
        }

        ^ .positionCircle {
          width: 21px;
          height: 21px;
          box-sizing: border-box;
          border-radius: 10.5px;
          background-color: #a4b3b8;
          margin: auto;

          background-size: 0 0;

          background-repeat: no-repeat;
          background-image: url(images/ic-approve.svg);

          -webkit-transition: all .15s ease-in-out;
          -moz-transition: all .15s ease-in-out;
          -ms-transition: all .15s ease-in-out;
          -o-transition: all .15s ease-in-out;
          transition: all .15s ease-in-out;
        }

        ^ .positionCircle:first-child {
          margin-top: 4px;
        }

        ^ .positionCircle.current {
          background-color: #1cc2b7;
        }

        ^ .positionCircle p {
          color: white;
          padding-top: 0.5px;
          line-height: 21px;
          width: 21px;
          font-size: 12px;
          text-align: center;
          margin: 0;

          -webkit-transition: font-size .25s ease-in-out;
          -moz-transition: font-size .25s ease-in-out;
          -ms-transition: font-size .25s ease-in-out;
          -o-transition: font-size .25s ease-in-out;
          transition: font-size .25s ease-in-out;
        }

        ^ .positionCircle.complete {
          background-color: #1cc2b7;
          background-size: 21px 21px;
        }

        ^ .positionCircle.complete p {
          font-size: 0;
        }

        ^ .positionLine {
          width: 1px;
          height: 20px;
          background-color: #a4b3b8;
          margin: 5px auto;
        }

        ^ .progressLine {
          width: 100%;
          height: 0;
          background-color: #1cc2b7;

          -webkit-transition: all .25s ease-in-out;
          -moz-transition: all .25s ease-in-out;
          -ms-transition: all .25s ease-in-out;
          -o-transition: all .25s ease-in-out;
          transition: all .25s ease-in-out;
        }

        ^ .progressLine.progressed {
          height: 100%;
        }

        ^ .progressLine.complete {
          background-color: #2cab70;
          height: 100%;
        }

        ^ .positionTitle {
          margin: 0;
          height: 21px;
          line-height: 30px;
          margin-bottom: 30px;

          font-size: 12px;
          letter-spacing: 0.3px;
          font-family: Roboto;
          color: #093649;

          -webkit-transition: all .15s ease-in-out;
          -moz-transition: all .15s ease-in-out;
          -ms-transition: all .15s ease-in-out;
          -o-transition: all .15s ease-in-out;
          transition: all .15s ease-in-out;
        }

        ^ .positionTitle.inactive {
          color: #a4b3b8;
        }
      */}
    })
  ],

  properties: [
    'titles',
    'position'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      
      this.addClass(this.myClass())
        .start('div').addClass('guideColumn')
          .start().forEach(this.titles, function(title, index) {
            this.start('div')
              .addClass('positionCircle')
              .addClass(self.complete$.map(function(flag) { return flag ? 'complete' : ''; }))
              .addClass(self.position$.map(function(p) { return index == p ? 'current' : index < p ? 'complete' : ''; }))
              .start('p').add(index + 1).end()
            .end();
            if ( index < self.titles.length - 1 ) {
              this.start('div').addClass('positionLine')
                .start('div')
                .addClass('progressLine')
                .addClass(self.position$.map(function(p) { return index == p - 1 ? 'progressed' : index < p - 1 ? 'complete' : ''; }))
                .end()
              .end();
            }
          }).end()
        .end()
        .start('div').addClass('titleColumn')
          .start().forEach(this.titles, function(title, index) {
            this.start('p')
            .addClass('positionTitle')
            .addClass(self.position$.map(function(p) { return index > p && ! self.complete ? 'inactive' : ''; }))
              .add(title)
            .end();
          }).end()
        .end()
    }
  ]
});
