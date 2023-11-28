/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.referral',
  name: 'ReferUserView',
  extends: 'foam.u2.View',

  css: `
    ^container{
      width: min(90vw, 424px);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      align-items: center;
      justify-content: space-between;
    }
    ^copy-box{
      background: $primary50;
      border: 1px dashed $primary400;
      padding: 1.5rem;  
      text-align: center;
    }
    ^error^copy-box {
      background: $destructive50;
      border-color: $destructive400;
    }
    ^header{
      font-size:3rem;
      color: $primary400;
      text-align: center;
      font-weight: 900;
    }
    ^ img{
      height: 5rem;
      width: 5rem;
    }

    @media only screen and (min-width: /*%DISPLAYWIDTH.MD%*/ 768px) {
      ^container{
        padding: 4rem 3rem;
      }
    }
  `,

  mixins: ['foam.u2.util.ClipboardAccess'],

  imports: [
    'theme',
    'subject'
  ],

   messages: [
     { name: 'HEADER_1', message: 'Share ' },
     { name: 'HEADER_2', message: ' With a Friend!' },
     { name: 'COPY_FAIL', message: 'Failed to copy!' },
     { name: 'COPYTEXT', message: 'Refer a friend' }
   ],

  properties: [
    {
      name: 'referralText',
      class: 'String'
    },
    'refLink'
  ],

  methods: [
    async function render() {
      this.refLink = (await this.subject.user.referralCodes.select()).array[0]?.url;
      this.referralText = this.COPYTEXT + '\n\n' + this.refLink;

      let button = navigator.canShare?.({text: this.referralText}) ? this.SHARE_TEXT : this.COPY_TEXT;

      this.addClass(this.myClass('container'))

        .start('img')
          .attr('src', this.theme.logo)
          .addClass(this.myClass('logo'))
        .end()

        .start().addClass(this.myClass('header'))
          .add(this.HEADER_1)
          .add(this.theme.appName)
          .add(this.HEADER_2)
        .end()

        .start()
          .addClass(this.myClass('copy-box'))
          .enableClass(this.myClass('error'), this.refLink$.map(v => ! v))
          .callIfElse(this.refLink, function() {
            this.translate(this.COPYTEXT)
            .tag('br')
            .tag('br')
            .add(this.refLink);
          }, function() {
            this.add('Something went wrong, please try again');
          })
        .end()

        .startContext({data:this})
          .start(button, { buttonStyle: 'PRIMARY', size: 'LARGE' }).addClass(this.myClass('share-button')).end()
        .endContext();
    }
  ],
  actions: [
    {
      name: 'shareText',
      label: 'Share',
      isAvailable: function(refLink) { return refLink },
      code: async function(_, x) {
       
        var shareData = {
          text: this.referralText
        };

        navigator.share(shareData);
      }
    },
    {
      name: 'copyText',
      label: 'Copy',
      isAvailable: function(refLink) { return refLink },
      code: async function() {
        this.copy(this.referralText)
      }
    }
  ]
});