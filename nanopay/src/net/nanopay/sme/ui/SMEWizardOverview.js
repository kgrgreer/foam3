foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEWizardOverview',
  extends: 'foam.u2.View',

  documentation: 'A view that displays the position of the user in the WizardView Stack. Ablii specific.',

  imports: [
    'complete',
    'viewData'
  ],

  css: `
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
      position: relative;
      width: 16px;
      height: 16px;
      box-sizing: border-box;
      border-radius: 10.5px;
      background-color: #a4b3b8;
      margin: auto;

      overflow: hidden;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .positionCircle img {
      position: absolute;
      top: -1;
      left: -2;
    }

    ^ .positionCircle.complete img {
      width: 21px;
      height: 21px;

      opacity: 1;
    }

    ^ .positionCircle:first-child {
      margin-top: 4px;
    }

    ^ .positionCircle.current {
      background-color: #0aab20;
    }

    ^ .positionCircle.complete {
      background: url(images/ic-approve.svg);
      background-position: center;
    }

    ^ .positionCircle.complete p {
      font-size: 0;
    }

    ^ .positionLine {
      width: 3px;
      height: 55px;
      background-color: #a4b3b8;
      margin: auto;
    }

    ^ .progressLine {
      width: 100%;
      height: 0;
      background-color: #0aab20;

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
      margin-bottom: 5px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
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

    ^ .caption {
      margin-bottom: 30px;
    }
  `,

  properties: [
    'titles',
    'position'
  ],

  messages: [
    { name: 'ADDITIONAL_INFORMATION', message: 'Additional information' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start().addClass('guideColumn')
          .start().forEach(this.titles, function(title, index) {
            this.start()
              .addClass('positionCircle')
              .addClass(self.complete$.map(function(flag) { return flag ? 'complete' : ''; }))
              .addClass(self.position$.map(function(p) { return index == p ? 'current' : index < p ? 'complete' : ''; }))
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
            .end()
            .start().addClass('caption').addClass('subdued-text').add(self.ADDITIONAL_INFORMATION).end();
          }).end()
        .end();
    }
  ]
});
