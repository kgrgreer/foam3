foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'QuestionView',
  extends: 'foam.u2.View',

  css: `
    ^ question {
      width: 218px;
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
    }
    ^ .response {
      padding-top: 8px;
      padding-bottom: 20px;
    }
    ^ .foam-u2-TextField.property-response {
      width: 540px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
  `,

  properties: [
    'question'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().addClass('question')
          .add(this.question.question)
        .end()
        .start().addClass('response')
          .add(this.question.RESPONSE)
        .end()
    }
  ]
});