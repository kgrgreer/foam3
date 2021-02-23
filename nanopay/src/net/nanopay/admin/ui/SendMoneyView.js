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
  package: 'net.nanopay.admin.ui',
  name: 'SendMoneyView',
  extends: 'foam.u2.View',

  documentation: 'Send Money View',

  methods: [
    function initE() {
      this.SUPER();

      this
        .tag({
          class: 'foam.u2.view.PopUpTitledView',
          title: 'Send Money',
          messageView: this.SendMoneyMessageView
        });
    }
  ],

  classes: [
    {
      name: 'SendMoneyMessageView',
      extends: 'foam.u2.View',
      
      requires: [ 
        'foam.nanos.auth.User',
        'foam.u2.search.GroupAutocompleteSearchView',
        'foam.u2.view.TextField'
      ],

      imports: [ 'userDAO' ],

      exports: [
        'removeChip'
      ],

      properties: [ 
        {
          class: 'foam.dao.DAOProperty',
          name: 'data',
          factory: function() { return this.userDAO; }
        },
        {
          name: 'labels',
          value: []
        },
        'autocompleteView'
      ],

      axioms: [
        foam.u2.CSS.create({
          code:
          `
          ^ .tag-container {
            margin: 5px 0px 20px 15px;
            display: inline-block;
          }

          ^ .foam-u2-ActionView-closeButton {
            width: 24px;
            height: 24px;
            margin: 0;
            margin-top: -10px;
            margin-right: 20px;
            cursor: pointer;
            display: inline-block;
            float: right;
            border: none;
            background: transparent;
            outline: none;
          }

          ^ .foam-u2-ActionView-closeButton:hover {
            outline: none;
            border: none;
            background: transparent;
          }

          ^ .short-box > .foam-u2-tag-Input {
            width: 275px;
          }
      `})],

      methods: [
        function initE() {
          this.SUPER();
          var self = this;

          this
            .addClass(this.myClass())
            .start('div')
              .start('p').addClass('summary-heading').add('Balance').end()
              .start('p').addClass('pDefault').add('$ 30000.22').end()
            .end()
            .start().addClass('input-container')
              .start('p').addClass('pDefault').add('Send To').end()
            .end()
            .add(this.slot(function(labels) {
              return this.E('div')
                .addClass('tag-container')
                .forEach(labels, function(label) {
                    this.tag({
                      class: 'foam.u2.view.ChipView',
                      data: label
                    })
                });
            }))
            .start()
              .addClass('short-box')
              .tag({
                class: 'foam.u2.search.GroupAutocompleteSearchView',
                property: foam.nanos.auth.User.EMAIL,
                dao: self.data,
                view$: self.autocompleteView$
              }).on('input', elem => self.verifyTag(elem))
            .end()
            .start().addClass('input-container')
              .start('p').addClass('pDefault').add('Amount').end()
              .start('input').addClass('input-Box').end()
            .end()
            .start().addClass('Button-Container')
              .start().addClass('Button').add('Next').end()
            .end();
        },

        function removeChip(data) {
          var labels = this.labels.filter(l => l != data);
          this.labels = labels;
        }
      ],

      listeners: [
        function verifyTag(elem) {
          var dataOptions = elem.target.list.options;

          for ( var i = 0 ; i < dataOptions.length ; i++ ) {
            if ( dataOptions[i].value == this.autocompleteView.data ) {
              var labels = foam.Array.clone(this.labels);
              labels.push(this.autocompleteView.data);
              this.labels = labels;

              this.autocompleteView.data = '';
              break;
            }
          }
        }
      ]
    }
  ]
})
