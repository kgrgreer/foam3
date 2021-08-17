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

package foam.box.sf;

import foam.core.ContextAwareSupport;
import foam.box.Message;
import foam.box.ProxyBox;

public class SFDemo extends ContextAwareSupport {

  public void runDemo() {

  }
  
  public static class ExceptionSendBox extends ProxyBox {
    @Override
    public void send(Message msg) {
      throw new RuntimeException("ExceptionSendBox: try again");
    }
  }

  public static class SuccessSendBox extends ProxyBox {
    @Override
    public void send(Message msg) {
      return ;
    }
  }

  public static class SuccessSendBox2 extends ProxyBox {
    volatile int i = 0;
    @Override
    public void send(Message msg) {
      i++;
      if ( i <= 2 ) return;
      throw new RuntimeException("SuccessSendBox2: try again");
    }
  }
}