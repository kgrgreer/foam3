/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

foam.ENUM({
  package: 'foam.box.sf',
  name: 'SFStatus',
  
  values: [
    {
      name: 'FAILURE',
      ordinal: 0,
      documentation: 'Msg is not send successfully, still retry.'
    },
    {
      name: 'COMPLETED',
      ordinal: 1,
      documentation: 'Msg is send successfully.'
    },
    {
      name: 'CANCELLED',
      ordinal: 2,
      documentation: 'Msg reach to retry limit.'
    },
  ]
})