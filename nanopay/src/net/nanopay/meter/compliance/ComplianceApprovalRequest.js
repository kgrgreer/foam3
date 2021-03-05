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
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  sections: [
    {
      name: 'complianceInformation',
      order: 20
    }
  ],

  properties: [
    {
      name: 'status',
      value: 'REQUESTED',
    },
    {
      class: 'Long',
      name: 'causeId',
      section: 'complianceInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'causeDaoKey',
      section: 'complianceInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      name: 'causeObject',
      label: '',
      section: 'complianceInformation',
      order: 30,
      transient: true
    },
    {
      class: 'FObjectProperty',
      name: 'causeObjectHelper',
      section: 'complianceInformation',
      transient: true,
      visibility: 'HIDDEN',
      expression: function(causeId, causeDaoKey) {
        if ( causeDaoKey !== '' ) {
          var key = causeDaoKey;
          if( ! this.__context__[key] ) {
            // if DAO doesn't exist in context, change daoKey from localMyDAO
            // (server-side) to myDAO (accessible on front-end)
            key = key.substring(5,6).toLowerCase() + key.substring(6);
          }
          this.__subContext__[key].find(causeId).then((obj) => {
            this.causeObject = obj;
          });
        }
        return null;
      }
    },
    {
      // TODO: True fix will be with ReferenceView
      class: 'String',
      name: 'referenceSummary',
      section: 'approvalRequestInformation',
      transient: true,
      tableWidth: 200,
      order: 31,
      gridColumns: 6,
      visibility: 'RO',
      tableCellFormatter: function(_,obj) {
        let self = this;

        if ( ! (obj.daoKey === "userCapabilityJunctionDAO") ){
          this.__subSubContext__[obj.daoKey].find(obj.objId).then(requestObj => {
            let referenceSummaryString = `ID:${obj.objId}`;
  
            if ( requestObj ){
              Promise.resolve(requestObj.toSummary()).then(function(requestObjSummary) {
                if ( requestObjSummary ){
                  referenceSummaryString = requestObjSummary;
                }

                self.add(referenceSummaryString);
              })
            }

          });
        } else {
          this.__subSubContext__[obj.daoKey].find(obj.objId).then(ucj => {

            let referenceSummaryString = `ID:${obj.objId}`;
  
            if ( ucj ){
              this.__subSubContext__.userDAO.find(ucj.sourceId).then(user => {
                if ( user && user.toSummary && user.toSummary() ){
                  referenceSummaryString = user.toSummary();
                }
  
                if (
                  foam.nanos.crunch.AgentCapabilityJunction.isInstance(ucj) &&
                  ucj.sourceId !== ucj.effectiveUser
                ){
                  this.__subSubContext__.userDAO.find(ucj.effectiveUser).then(effectiveUser => {
                    let effectiveUserString = `U:${ucj.effectiveUser}`;
                    if (effectiveUser && effectiveUser.toSummary() ){
                      effectiveUserString = effectiveUser.toSummary();
                    }
  
                    referenceSummaryString = `${effectiveUserString}: ${referenceSummaryString}`;
  
                    self.add(referenceSummaryString);
                  })
                } else {
                  self.add(referenceSummaryString);
                }
              })
            }
          });
        }
      },
      view: function(_, X) {
        let slot = foam.core.SimpleSlot.create();
        let data = X.data;

        if ( ! (data.daoKey === "userCapabilityJunctionDAO") ){
          X[data.daoKey].find(data.objId).then(requestObj => {
            let referenceSummaryString = `ID:${data.objId}`;

            if ( requestObj ){
              Promise.resolve(requestObj.toSummary()).then(function(requestObjSummary) {
                if ( requestObjSummary ){
                  referenceSummaryString = requestObjSummary;
                }

                slot.set(referenceSummaryString);
              })
            }
          })
        } else {
          X[data.daoKey].find(data.objId).then(ucj => {
            let referenceSummaryString = `ID:${data.objId}`;
  
            if ( ucj ){
              X.userDAO.find(ucj.sourceId).then(user => {
                if ( user && user.toSummary && user.toSummary() ){
                  referenceSummaryString = user.toSummary();
                }
  
                if (
                  foam.nanos.crunch.AgentCapabilityJunction.isInstance(ucj) &&
                  ucj.sourceId !== ucj.effectiveUser
                ){
                  X.userDAO.find(ucj.effectiveUser).then(effectiveUser => {
                    let effectiveUserString = `U:${ucj.effectiveUser}`;
                    if (effectiveUser && effectiveUser.toSummary() ){
                      effectiveUserString = effectiveUser.toSummary();
                    }
  
                    referenceSummaryString = `${effectiveUserString}: ${referenceSummaryString}`;
  
                    slot.set(referenceSummaryString);
                  })
                } else {
                  slot.set(referenceSummaryString);
                }
              })
            }
  
            slot.set(referenceSummaryString);
          })
        }
        
        return {
          class: 'foam.u2.view.ValueView',
          data$: slot
        };
      }
    },
    {
      name: 'effectiveUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      section: 'complianceInformation',
      documentation: `
        The entity that the user in the approval request is acting as
      `,
      order: 32,
      gridColumns: 6
    }
  ]
});
