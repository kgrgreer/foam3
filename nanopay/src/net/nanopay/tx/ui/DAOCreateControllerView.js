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
    package: 'net.nanopay.tx.ui',
    name: 'DAOCreateControllerView',
    extends: 'foam.u2.View',
  
    requires: [
      'foam.comics.DAOCreateController',
      'foam.log.LogLevel'
    ],
  
    imports: [
      'dao',
      'notify',
      'stack'
    ],
  
    exports: [
      'data'
    ],
  
    properties: [
      {
        class: 'FObjectProperty',
        of: 'foam.comics.DAOCreateController',
        name: 'data',
        factory: function() {
          return this.DAOCreateController.create({ dao: this.dao });
        }
      },
      {
        class: 'String',
        name: 'title',
        expression: function(data$dao$of) {
          return 'Create ' + data$dao$of.name;
        }
      },
      {
        class: 'foam.u2.ViewSpec',
        name: 'detailView'
      }
    ],
  
    reactions: [
      [ 'data', 'finished', 'onFinished' ],
      [ 'data', 'throwError', 'onThrowError' ]
    ],
  
    methods: [
      function initE() {
        this.
        addClass(this.myClass()).
        start('table').addClass('createControllerTable').
          start('tr').
            start('td').style({'vertical-align': 'top', 'width': '100%'}).
              start('span').
                style({background: 'rgba(0,0,0,0)'}).
                show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
              end().
              tag(this.detailView, {data$: this.data$.dot('data'), fromCreateButton: true }).
              start().
                  style({'padding-bottom': '4px'}).
                  add(this.data.cls_.getAxiomsByClass(foam.core.Action)).
                end().
            end().
          end().
        end();
      }
    ],
  
    listeners: [
      function onFinished() {
        this.stack.back();
      },
      function onThrowError() {
        var self = this;
        this.notify(self.data.exception.message, '', this.LogLevel.ERROR, true);
      }
    ]
  });