/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

public interface TRIE {
  public TRIE add(String s);
  public boolean contains(String s);
}
