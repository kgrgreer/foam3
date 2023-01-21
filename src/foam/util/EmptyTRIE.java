/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import java.util.Map;
import java.util.HashMap;

// TODO:
//   Make a concurrent TRIE
//   Split on '.'

public class EmptyTRIE
 implements TRIE
{
 private static TRIE instance_ = new EmptyTRIE();

 public static TRIE instance() { return instance_; }

 private EmptyTRIE() {}

 public TRIE add(String s) {
   if ( s.length() == 0 ) return this;
   return "*".equals(s) ? WildcardTRIE.instance() : new HashTRIE(s);
 }

 public boolean contains(String s) { return false; }
}


class WildcardTRIE
 implements TRIE
{
 private static TRIE instance_ = new WildcardTRIE();

 public static TRIE instance() { return instance_; }

 private WildcardTRIE() {}

 public TRIE add(String s) { return this; }

 public boolean contains(String s) { return true; }
}


class HashTRIE
 implements TRIE
{
 protected Map<String, TRIE> map_ = new HashMap<String, TRIE>();

 public HashTRIE(String s) { add(s); }

 public TRIE add(String s) {
   if ( "*".equals(s) ) return WildcardTRIE.instance();
   if ( s.length() == 0 ) return this;
   map_.put(s.substring(0, 1), new HashTRIE(s.substring(1)));
   return this;
 }

 public boolean contains(String s) {
   if ( s.length() == 0 ) return true;

   return map_.get(s.substring(0, 1)).contains(s.substring(1));
 }
}
