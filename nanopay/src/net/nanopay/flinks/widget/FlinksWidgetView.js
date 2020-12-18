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
  package: 'net.nanopay.flinks.widget',
  name: 'FlinksWidgetView',
  extends: 'foam.u2.Controller',
  
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'auth',
    'user',
    'stack',
    'userDAO',
    'flinksLoginIdDAO',
    'twofactor',
    'notificationSettingDAO',
    'notify',
    'appConfig'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.ui.ExpandContainer',
    'net.nanopay.flinks.external.FlinksLoginId'
  ],

  css:`
    .file-iframe {
      height: 100%;
      width: 100%;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'theme',
      value: 'light'
    },
    {
      class: 'Boolean',
      name: 'desktopLayout',
      value: true
    },
    {
      class: 'Boolean',
      name: 'institutionFilterEnable',
      value: true
    },
    {
      class: 'String',
      name: 'redirectUrl'
    },
    {
      class: 'Boolean',
      name: 'jsRedirect',
      value: true
    },
    {
      class: 'Boolean',
      name: 'innerRedirect',
      value: true
    },
    {
      class: 'Boolean',
      name: 'demo'
    },
    {
      class: 'String',
      name: 'tag',
      value: 'addAccount'
    },
    {
      class: 'Boolean',
      name: 'consentEnabled',
      value: true
    },
    {
      class: 'Boolean',
      name: 'accountSelectorEnabled',
      value: true
    },
    {
      class: 'String',
      name: 'loginId'
    },
    {
      class: 'String',
      name: 'institution'
    },
    {
      class: 'String',
      name: 'accountId'
    },
    {
      class: 'String',
      name: 'accountSelectorCurrency',
      value: 'cad'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.external.FlinksLoginId',
      name: 'response'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      
      if ( ! this.response ) {
        var url = 'https://nanopay-iframe.private.fin.ag/' + 
                  '?theme=' + this.theme + 
                  '&desktopLayout=' + this.desktopLayout + 
                  '&institutionFilterEnable=' + this.institutionFilterEnable + 
                  '&jsRedirect=' + this.jsRedirect +
                  '&innerRedirect=' + this.innerRedirect +
                  '&demo=' + this.demo + 
                  '&tag=' + this.tag + 
                  '&consentEnable=' + this.consentEnabled + 
                  '&accountSelectorEnable=' + this.accountSelectorEnabled +
                  '&accountSelectorCurrency=' + this.accountSelectorCurrency;

        if ( ! this.redirectUrl && this.redirectUrl != '' ) {
          // Redirect to thank you page while waiting for java script stack.push in listener
          // var encodeRedirectUrl = encodeURIComponent(this.appConfig.url + '/thankYou.html');
          var encodeRedirectUrl = encodeURIComponent(this.redirectUrl);
          url += '&redirectUrl=' + encodeRedirectUrl;
        }

        this
          .start('iframe')
            .addClass('file-iframe')
            .attrs({ src: url })
            .style({
              visibility: 'visible'
            })
          .end();
      } else {
        this
          .start()
            .add(this.response)
          .end();
      }
    }
  ]
});
