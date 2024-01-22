/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ReleaseCashInApprovalType',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
  	{
  		class: 'String',
  		name: 'id'
  	},
  	{
  		class: 'Reference',
  		of: 'foam.nanos.approval.ApprovalRequestClassification',
  		name: 'classification'
  	},
  	{
  		class: 'Reference',
  		of: 'foam.nanos.auth.ServiceProvider',
  		name: 'spid'
  	}
  ]
});
