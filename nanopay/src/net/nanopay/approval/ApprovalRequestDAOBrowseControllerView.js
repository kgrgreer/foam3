/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.approval',
  name: 'ApprovalRequestDAOBrowseControllerView',
  extends: 'foam.comics.v2.DAOBrowseControllerView',

  imports: [
    'user'
  ],

  documentation: `
    A configurable summary view for the ApprovalRequestDAO
  `,

  methods: [
    function initE() {
    var self = this;
      this.addClass(this.myClass())
      .add(this.slot(function(user, data, config, config$browseBorder, config$browseViews, config$browseTitle) {
        return self.E()
          .start(self.Rows)
            .addClass(self.myClass('container'))
            .start(self.Cols)
              .addClass(self.myClass('header-container'))
              .start()
                .addClass(self.myClass('browse-title'))
                .add(config$browseTitle)
              .end()
            .end()
            .start(self.CardBorder)
              .style({ position: 'relative' })
              .start(config$browseBorder)
                .callIf(config$browseViews.length > 1, function() {
                  this
                    .start(self.IconChoiceView, { 
                      choices:config$browseViews.map(o => [o.view, o.icon]),
                      data$: self.browseView$
                    })
                      .addClass(self.myClass('altview-container'))
                    .end();
                })
                .add(self.slot(function(browseView) {
                  var cannedQueries = [
                    {
                      class: 'foam.comics.v2.CannedQuery',
                      label: 'All',
                      predicateFactory: function(e) {
                        return e.TRUE;
                      }
                    }
                  ];


                  return user.capabilities.dao.select().then(capabilities => {
                    var capabilitiesArray = capabilities.array;

                    var accountTabFlag = false;
                    var roleTabFlag = false;
                    var ruleTabFlag = false;
                    var transactionTabFlag = false;

                    for ( var i = 0; i < capabilitiesArray.length; i++ ){
                      var capability = capabilitiesArray[i];

                      if ( ! accountTabFlag && capability.id.toLowerCase().includes("account.approver") ) {
                        cannedQueries.push({
                          class: 'foam.comics.v2.CannedQuery',
                          label: 'Accounts',
                          predicateFactory: function(e) {
                            return e.AND(e.INSTANCE_OF(),e.EQ());
                          }
                        })
                        accountTabFlag = true;
                      } 
                      if ( ! roleTabFlag && capability.id.toLowerCase().includes("role.approver") ) {
                        cannedQueries.push({
                          class: 'foam.comics.v2.CannedQuery',
                          label: 'Roles',
                          predicateFactory: function(e) {
                            return e.AND(e.INSTANCE_OF(),e.EQ());
                          }
                        })
                        roleTabFlag = true;
                      } 
                      if ( ! ruleTabFlag && capability.id.toLowerCase().includes("rule.approver") ) {
                        cannedQueries.push({
                          class: 'foam.comics.v2.CannedQuery',
                          label: 'Rules',
                          predicateFactory: function(e) {
                            return e.AND(e.INSTANCE_OF(),e.EQ());
                          }
                        })
                        ruleTabFlag = true;
                      } 
                      if ( ! transactionTabFlag && capability.id.toLowerCase().includes("transaction.approver") ) {
                        cannedQueries.push({
                          class: 'foam.comics.v2.CannedQuery',
                          label: 'Transactions',
                          predicateFactory: function(e) {
                            return e.AND(e.INSTANCE_OF(),e.EQ());
                          }
                        })
                        transactionTabFlag = true;
                      }

                      if ( accountTabFlag && roleTabFlag && ruleTabFlag && transactionTabFlag ) break;
                    }

                    var newConfig = config.clone().copyFrom({
                      cannedQueries
                    })

                    return self.E().tag(browseView, {data: data, config: newConfig});
                  });
        
                }))
              .end()
            .end()
          .end();
      }));
    }
  ]
});
