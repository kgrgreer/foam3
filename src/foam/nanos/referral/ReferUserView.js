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
      container: wrapper / inline-size;
      height: fit-content;
      align-items: center;
      justify-content: space-between;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    ^copy-box{
      background: $primary50;
      border: 1px dashed $primary400;
      padding: 1.5rem;
      text-align: center;
      width: 100%;
      word-break: break-all;
    }
    ^error^copy-box {
      background: $destructive50;
      border-color: $destructive400;
    }
    ^header{
      display: flex; 
      flex-direction: column;
      gap: 1.2rem;
      text-align: center;
    }
    ^header > .h300{
      font-weight: 900;
      color: $primary400;
    }
    ^item .h400 {
      line-height: 32px;
      color: $primary400;
    }
    ^header > .p,^item .p {
      color: $grey500;
    }
    ^item {
      display: flex;
      gap: 0.4rem;
      align-self: flex-start;
    }
    ^item > *:last-child {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    ^item img {
      height: 16;
      align-self: center;
    }
    @container wrapper (width > 576px) {
      ^copy-box {
        width: fit-content;
      }
      ^item {
        text-align: center;
        align-self: inherit;
      }
    }
  `,

  mixins: ['foam.u2.util.ClipboardAccess'],

  imports: [
    'theme',
    'subject'
  ],

   messages: [
     { name: 'HEADER_1', message: 'Share ${appName} With a Friend!', template: true },
     { name: 'HEADER_2', message: 'You both get payment credits when your friend completes their first transaction'},
     { name: 'ITEM_1', message: 'You get ${amount}', template: true },
     { name: 'SUB_ITEM_1', message: 'On your next transaction'},
     { name: 'ITEM_2', message: 'They get ${amount}', template: true },
     { name: 'SUB_ITEM_2', message: 'On their second transaction'},
     { name: 'COPY_FAIL', message: 'Failed to copy!' },
     { name: 'COPYTEXT', message: 'Refer a friend' },
     //TODO: AMOUNTS SHOULD BE FETCHED FROM CREDIT CODES
     { name: 'AMOUNT_1', message: '$10.00' },
     { name: 'AMOUNT_2', message: '$10.00' }
   ],

  properties: [
    {
      name: 'referralText',
      class: 'String'
    },
    'refLink'
  ],

  methods: [
    function render() {
      let self = this;
      this.refLink = this.subject.user.referralCodes.where(
        this.Eq.create({arg1: foam.nanos.referral.ReferralCode.AUTO_GENERATED, arg2: true})
      ).select().then(v => {
        this.refLink = v.array[0]?.url;
        this.referralText = this.COPYTEXT + '\n\n' + this.refLink;
      });

      let iconConfig = {
        size: 32,
        backgroundColor: this.color = foam.CSS.returnTokenValue('$primary50', this.cls_, this.__subContext__)
      }
      let fill = foam.CSS.returnTokenValue('$primary700', this.cls_, this.__subContext__)

      let button = navigator.canShare?.({text: this.referralText}) ? this.SHARE_TEXT : this.COPY_TEXT;
      this
          .addClass(this.myClass('container'))

          .start()
            .addClass(this.myClass('header'))
            .start().addClass('h300').add(this.HEADER_1({ appName: this.theme.appName })).end()
            .start().addClass('p').add(this.HEADER_2).end()
          .end()
          .start()
            .addClass(this.myClass('item'))
            .tag(foam.u2.tag.CircleIndicator, {
              ...iconConfig,
              icon: this.theme?.glyphs.dollar?.getDataUrl({ fill: fill }),
              label: this.theme?.glyphs.dollar ? null : '1'
            })
            .start()
              .start().addClass('h400').add(this.ITEM_1({ amount: this.AMOUNT_1 })).end()
              .start().addClass('p').add(this.SUB_ITEM_1).end()
            .end()
          .end()
          .start()
            .addClass(this.myClass('item'))
            .tag(foam.u2.tag.CircleIndicator, {
              ...iconConfig,
              icon: this.theme?.glyphs.gift?.getDataUrl({ fill: fill }),
              label: this.theme.glyphs.gift ? null : '2'
            })
            .start()
              .start().addClass('h400').add(this.ITEM_2({ amount: this.AMOUNT_2 })).end()
              .start().addClass('p').add(this.SUB_ITEM_2).end()
            .end()
          .end()
        
          .start()
            .addClass(this.myClass('copy-box'))
            .enableClass(this.myClass('error'), this.refLink$.map(v => ! v))
            .add(this.dynamic(function(refLink) {
              this.removeAllChildren()
              if (refLink) {
                this.add(self.COPYTEXT)
                .tag('br')
                .tag('br')
                .add(self.refLink);
              } else {
                this.add('Something went wrong, please try again');
              }
            }))
          .end()
          .startContext({data:this})
            .start(button, { buttonStyle: 'PRIMARY', size: 'LARGE' }).addClass(this.myClass('share-button')).end()
          .endContext()
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


foam.CLASS({
  package: 'foam.nanos.referral',
  name: 'ReferralBorder',
  extends: 'foam.u2.View',
  documentation: `Wraps ReferUserView in a border so it can be used around DAO views`,
  requires: ['foam.nanos.referral.ReferUserView'],
  css: `
    ^ {
      container: outer / inline-size;
    }
    ^wrapper {
      padding: 1em;
      display: flex;
      gap: 2rem;
      height: 100%;
      overflow: auto;
    }
    ^wrapper > *:last-child {
      flex: 1;
      //Width needed as a start point for flex to prevent overflow;
      width: 100px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1em;
    }
    ^wrapper > *:first-child {
      flex: 0 0 30%;
    }
    @container outer (width < 768px) {
      ^wrapper {
        flex-direction: column;
      }
      ^wrapper > *:first-child, ^wrapper > *:last-child {
        width: 100%;
        align-self: center;
      }
    }
  `,
  methods: [
    function init() {
      this
        .addClass()
        .start()
          .addClass(this.myClass('wrapper'))
          .tag(this.ReferUserView)
          .start()
            .start().addClass('h500').add('Rewards History').end()
            .start(foam.u2.borders.CardBorder).style({ width: '100%' }).tag('', {}, this.content$).end()
          .end()
        .end()
    }
  ]
});