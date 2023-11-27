/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
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
      border-style: dashed;
      border-color: $primary400;
      border-width: 2px;
      padding: 1.5rem;  
      text-align: center;
      border-width: thin;
    }
    ^header{
      font-size:3rem;
      color: $primary500;
      text-align: center;
      font-weight: 900;
    }
    img{
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
    }

  ],

  methods: [
    async function render() {
      let refLink = (await this.subject.user.referralCodes.select()).array[0].url;
      this.referralText = this.COPYTEXT + '\n\n' + refLink;

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

        .start().addClass(this.myClass('copy-box'))
          .translate(this.COPYTEXT)
          .tag('br')
          .tag('br')
          .add(refLink)
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
      code: async function() {
        this.copy(this.referralText)
      }
    }
  ]
});
