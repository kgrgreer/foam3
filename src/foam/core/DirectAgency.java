/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/**
 * AsyncAgency is passed to async rule.action
 * for immediate execution of agent.
 */
public class DirectAgency extends AbstractAgency {
  public void submit(X x, ContextAgent agent, String description) {
    agent.execute(x);
  }
}
