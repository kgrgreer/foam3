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
          margin-right: 20px;
        }

        ^ .titleColumn {
          display: inline-block;
          width: 75%;
          vertical-align: top;
        }

        ^ .positionCircle {
          width: 12px;
          height: 12px;
          box-sizing: border-box;
          border: solid 1px rgba(164, 179, 184, 0.5);
          border-radius: 6px;
          background-color: #FFFFFF;
          margin: auto;
        }

        ^ .positionCircle:first-child {
          margin-top: 4px;
        }

        ^ .positionCircle.current {
          border: solid 1px #23c2b7;
          background-color: #FFFFFF;
        }

        ^ .positionCircle.complete {
          border: solid 1px #23c2b7;
          background-color: #23c2b7 !important;
        }

        ^ .positionLine {
          width: 2px;
          height: 38px;
          background-color: rgba(164, 179, 184, 0.5);
          margin: auto;
        }

        ^ .positionTitle {
          margin: 0;
          height: 20px;
          line-height: 20px;
          margin-bottom: 30px;

          font-size: 12px;
          letter-spacing: 0.3px;
          font-family: Roboto;
          color: #093649;
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
            .end();
            if ( index < self.titles.length - 1 ) {
              this.start('div').addClass('positionLine').end();
            }
          }).end()
        .end()
        .start('div').addClass('titleColumn')
          .start().forEach(this.titles, function(title, index) {
            this.start('p').addClass('positionTitle').add(title).end();
          }).end()
        .end()
    }
  ]
});
