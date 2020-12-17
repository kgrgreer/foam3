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
  package: 'net.nanopay.flinks.view',
  name: 'FlinksInstitutionsView',
  extends: 'foam.u2.View',

  documentation: 'Screen to select which bank you wish you to connect to using Flinks',

  requires: [
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'ctrl',
    'appConfig',
    'stack'
  ],

  css: `
    ^institution-container {
      width: 100%;
      text-align: center;
    }

    ^institution-card {
      display: inline-block;
      box-sizing: border-box;
      text-align: center;
      width: 244px;
      height: 133px;
      padding: 0 40px;
      background-color: white;

      box-shadow: 0 1px 1px 0 #dae1e9;

      -webkit-transition: box-shadow .15s ease-in-out;
      -moz-transition: box-shadow .15s ease-in-out;
      -ms-transition: box-shadow .15s ease-in-out;
      -o-transition: box-shadow .15s ease-in-out;
      transition: box-shadow .15s ease-in-out;
    }

    ^institution-card:hover {
      cursor: pointer;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    }

    ^institution-spacer {
      margin-right: 17px;
      margin-bottom: 16px;
    }

    ^institution-image-helper {
      display: inline-block;
      vertical-align: middle;
      height: 100%;
    }

    ^institution-image {
      display: inline-block;
      vertical-align: middle;
      width: 100%;
    }

    ^no-content {
      text-align: center;
      font-size: 16px;
      font-weight: normal;
      color: #8e9090;
    }

    ^otherbank-container {
      text-align: center;
      margin-bottom: 20px;
    }

    ^otherbank-container p {
      display: inline-block;
      font-size: 16px;
    }

    ^plain-text {
      margin-right: 3px;
    }

    ^link-text {
      color: /*%PRIMARY3%*/ #406dea;
      cursor: pointer;
    }
  `,

  properties: [
    {
      name: 'bankInstitutions',
      factory: function() {
        return [
          { name: 'ATB',          description: 'ATB Financial',                                             image: 'images/banks/atb.svg' },
          { name: 'BMO',          description: 'Bank of Montreal',                                          image: 'images/banks/bmo.svg' },
          { name: 'CIBC',         description: 'Canadian Imperial Bank of Commerce',                        image: 'images/banks/cibc.svg' },
          { name: 'CoastCapital', description: 'Coast Capital Savings Credit Union',                        image: 'images/banks/coast.svg' },
          { name: 'Desjardins',   description: 'Desjardins Quebec',                                         image: 'images/banks/desjardins.svg' },
          { name: 'HSBC',         description: 'HSBC Canada',                                               image: 'images/banks/hsbc.svg' },
          { name: 'Meridian',     description: 'Meridian Credit Union',                                     image: 'images/banks/meridian.png' },
          { name: 'National',     description: 'National Bank of Canada',                                   image: 'images/banks/national.svg' },
          { name: 'Laurentienne', description: 'Banque Laurentienne du Canada',                             image: 'images/banks/laurentienne.svg' },
          { name: 'Simplii',      description: 'Simplii Financial (Former President\'s Choice Financial)',  image: 'images/banks/simplii@3x.png' },
          { name: 'RBC',          description: 'Royal Bank of Canada',                                      image: 'images/banks/rbc.svg' },
          { name: 'Scotia',       description: 'The Bank of Nova Scotia',                                   image: 'images/banks/scotia.svg' },
          { name: 'Tangerine',    description: 'Tangerine Bank',                                            image: 'images/banks/tangerine.svg' },
          { name: 'TD',           description: 'Toronto-Dominion Bank',                                     image: 'images/banks/td.svg' },
          { name: 'Vancity',      description: 'Vancouver City Savings Credit Union',                       image: 'images/banks/vancity.svg' }
        ];
      }
    },
    {
      name: 'filteredInstitutions',
      factory: function() {
        return this.bankInstitutions;
      }
    },
    {
      class: 'String',
      name: 'filterFor',
      factory: function() {
        return '';
      },
      postSet: function(o, n) {
        if ( n === '' ) {
          this.filteredInstitutions = this.bankInstitutions
          return;
        }
        var lowercasedN = n.toLowerCase();
        this.filteredInstitutions = this.bankInstitutions.filter(function(inst) {
          var lowercasedName = inst.name.toLowerCase();
          var lowercasedDesc = inst.description.toLowerCase();
          return lowercasedName.includes(lowercasedN) || lowercasedDesc.includes(lowercasedN);
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isSingleSelection',
      value: false
    },

    // Intemediary property to be passed on to wizards
    'onComplete'
  ],

  messages: [
    { name: 'NO_MATCH_FOUND', message: 'We could not find any banks with that name' },
    { name: 'OTHER_BANK', message: 'Don\'t see your bank here?' },
    { name: 'CLICK_HERE', message: 'Connect with a void check' }
  ],

  methods: [
    function init() {
      if ( ! this.isProduction() ) {
        this.bankInstitutions.push({
          name: 'FlinksCapital',
          description: 'Flinks Example',
          image: 'images/banks/flinks.svg'
        });
      }
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start().addClass(this.myClass('institution-container'))
          .add(this.slot(function(filterFor) {
            if ( self.filteredInstitutions.length > 0 ) {
              return this.E().forEach(self.filteredInstitutions, function(institution, index) {
                this.start().attrs({ name: institution.name }).addClass(self.myClass('institution-card')).addClass(self.myClass('institution-spacer'))
                  .start().addClass(self.myClass('institution-image-helper')).end()
                  .start({ class: 'foam.u2.tag.Image', data: institution.image }).addClass(self.myClass('institution-image')).end()
                  .on('click', function() {
                    self.ctrl.add(self.Popup.create().tag({
                      class: 'net.nanopay.flinks.view.modalForm.FlinksModalForm',
                      institution: institution,
                      isSingleSelection: self.isSingleSelection,
                      onComplete: self.onComplete
                    }));
                  })
                  .end();
                });
            }
            return this.E().start('p').addClass(self.myClass('no-content')).add(self.NO_MATCH_FOUND).end();
          }))
        .end();
    },

    function isProduction() {
      return this.appConfig.mode && this.appConfig.mode.label === 'Production';
    }
  ]
});
