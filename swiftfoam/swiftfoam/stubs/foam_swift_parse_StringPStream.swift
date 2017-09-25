// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class StringPStream: AbstractFObject, PStream {

  public var str: Reference<String> {
    get {
      
if _str_inited_ {
  return _str_!
}

fatalError("No default value for str")

      
    }
set(value) {
      
self.set(key: "str", value: value)
      
    }
  }

  var _str_: Reference<String>! = nil

  var _str_inited_: Bool = false

  public static let STR: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "str"
  let classInfo: ClassInfo
  let transient = false
  let label = "Str" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var str_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "str",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var str_Value_Sub_: Subscription?

  public var str$: Slot {
    get {
      return self.str_Value_
    }
set(value) {
      
self.str_Value_Sub_?.detach()
self.str_Value_Sub_ = self.str$.linkFrom(value)
self.onDetach(self.str_Value_Sub_!)
      
    }
  }

  public var value_: Any? {
    get {
      
if _value__inited_ {
  return _value__
}

return nil

      
    }
set(value) {
      
self.set(key: "value_", value: value)
      
    }
  }

  var _value__: Any? = nil

  var _value__inited_: Bool = false

  public static let VALUE_: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "value_"
  let classInfo: ClassInfo
  let transient = false
  let label = "Value_" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var value__Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "value_",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var value__Value_Sub_: Subscription?

  public var value_$: Slot {
    get {
      return self.value__Value_
    }
set(value) {
      
self.value__Value_Sub_?.detach()
self.value__Value_Sub_ = self.value_$.linkFrom(value)
self.onDetach(self.value__Value_Sub_!)
      
    }
  }

  public var pos: Int {
    get {
      
if _pos_inited_ {
  return _pos_!
}

return 0

      
    }
set(value) {
      
self.set(key: "pos", value: value)
      
    }
  }

  var _pos_: Int! = nil

  var _pos_inited_: Bool = false

  public static let POS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "pos"
  let classInfo: ClassInfo
  let transient = false
  let label = "Pos" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var pos_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "pos",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var pos_Value_Sub_: Subscription?

  public var pos$: Slot {
    get {
      return self.pos_Value_
    }
set(value) {
      
self.pos_Value_Sub_?.detach()
self.pos_Value_Sub_ = self.pos$.linkFrom(value)
self.onDetach(self.pos_Value_Sub_!)
      
    }
  }

  public var tail_: StringPStream? {
    get {
      
if _tail__inited_ {
  return _tail__
}

return nil

      
    }
set(value) {
      
self.set(key: "tail_", value: value)
      
    }
  }

  var _tail__: StringPStream? = nil

  var _tail__inited_: Bool = false

  public static let TAIL_: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "tail_"
  let classInfo: ClassInfo
  let transient = false
  let label = "Tail_" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var tail__Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "tail_",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var tail__Value_Sub_: Subscription?

  public var tail_$: Slot {
    get {
      return self.tail__Value_
    }
set(value) {
      
self.tail__Value_Sub_?.detach()
self.tail__Value_Sub_ = self.tail_$.linkFrom(value)
self.onDetach(self.tail__Value_Sub_!)
      
    }
  }

  lazy var head$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`head`(
        )
  }
])
      
  }()

  public static let HEAD: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "head"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var valid$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`valid`(
        )
  }
])
      
  }()

  public static let VALID: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "valid"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var tail$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`tail`(
        )
  }
])
      
  }()

  public static let TAIL: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "tail"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var substring$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let end = args[0] as! PStream

    
    return self!.`substring`(
        _: end)
  }
])
      
  }()

  public static let SUBSTRING: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "substring"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var value$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`value`(
        )
  }
])
      
  }()

  public static let VALUE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "value"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var setValue$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let value = args[0]

    
    return self!.`setValue`(
        _: value)
  }
])
      
  }()

  public static let SET_VALUE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "setValue"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_str_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Reference<String> {
    
if let s = newValue as? String {
  return Reference(value: s)
}
return newValue as! Reference<String>
      
  }

  private func `_str_preSet_`(_ oldValue: Any?, _ newValue: Reference<String>) -> Reference<String> {
    return newValue
  }

  private func `_str_postSet_`(_ oldValue: Any?, _ newValue: Reference<String>) {
    
  }

  private func `_value__adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value__preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value__postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_pos_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        
  }

  private func `_pos_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_pos_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_tail__adapt_`(_ oldValue: Any?, _ newValue: Any?) -> StringPStream? {
    return newValue as! StringPStream?
  }

  private func `_tail__preSet_`(_ oldValue: Any?, _ newValue: StringPStream?) -> StringPStream? {
    return newValue
  }

  private func `_tail__postSet_`(_ oldValue: Any?, _ newValue: StringPStream?) {
    
  }

  public func `head`() -> Character {
    
return str.value.char(at: pos)
      
  }

  public func `valid`() -> Bool {
    
return pos < str.value.characters.count
      
  }

  public func `tail`() -> PStream {
    
if tail_ == nil {
  tail_ = StringPStream([
    "str": str,
    "pos": pos + 1,
  ])
}
return tail_!
      
  }

  public func `substring`(_ end: PStream) -> String {
    
let startIndex = str.value.index(str.value.startIndex, offsetBy: pos)
let endIndex = str.value.index(str.value.startIndex, offsetBy: (end as! StringPStream).pos)
return str.value[startIndex..<endIndex]
      
  }

  public func `value`() -> Any? {
    
return value_
      
  }

  public func `setValue`(_ value: Any?) -> PStream {
    
let ps = StringPStream([
  "str": str,
  "pos": pos,
  "value_": value,
])
return ps
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return StringPStream.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return StringPStream.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "str":
    _str_inited_ = false
    _str_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "str"]) {
      _ = pub(["propertyChange", "str", str$])
    }
    break

  case "value_":
    _value__inited_ = false
    _value__ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "value_"]) {
      _ = pub(["propertyChange", "value_", value_$])
    }
    break

  case "pos":
    _pos_inited_ = false
    _pos_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "pos"]) {
      _ = pub(["propertyChange", "pos", pos$])
    }
    break

  case "tail_":
    _tail__inited_ = false
    _tail__ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "tail_"]) {
      _ = pub(["propertyChange", "tail_", tail_$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "str": return `_str_inited_`

  case "value_": return `_value__inited_`

  case "pos": return `_pos_inited_`

  case "tail_": return `_tail__inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "str": return `str`

  case "value_": return `value_`

  case "pos": return `pos`

  case "tail_": return `tail_`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "str": return `str$`

  case "value_": return `value_$`

  case "pos": return `pos$`

  case "tail_": return `tail_$`


  case "head": return `head$`

  case "valid": return `valid$`

  case "tail": return `tail$`

  case "substring": return `substring$`

  case "value": return `value$`

  case "setValue": return `setValue$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "str$":
    str$ = value as! Slot
    return
  case "str":
  
    let oldValue: Any? = _str_inited_ ? self.`str` : nil
    _str_ = _str_preSet_(oldValue, _str_adapt_(oldValue, value))
    _str_inited_ = true
    _str_postSet_(oldValue, _str_)
    if hasListeners(["propertyChange", "str"]) && !FOAM_utils.equals(oldValue, _str_) {
      _ = pub(["propertyChange", "str", str$])
    }
    return

  case "value_$":
    value_$ = value as! Slot
    return
  case "value_":
  
    let oldValue: Any? = _value__inited_ ? self.`value_` : nil
    _value__ = _value__preSet_(oldValue, _value__adapt_(oldValue, value))
    _value__inited_ = true
    _value__postSet_(oldValue, _value__)
    if hasListeners(["propertyChange", "value_"]) && !FOAM_utils.equals(oldValue, _value__) {
      _ = pub(["propertyChange", "value_", value_$])
    }
    return

  case "pos$":
    pos$ = value as! Slot
    return
  case "pos":
  
    let oldValue: Any? = _pos_inited_ ? self.`pos` : nil
    _pos_ = _pos_preSet_(oldValue, _pos_adapt_(oldValue, value))
    _pos_inited_ = true
    _pos_postSet_(oldValue, _pos_)
    if hasListeners(["propertyChange", "pos"]) && !FOAM_utils.equals(oldValue, _pos_) {
      _ = pub(["propertyChange", "pos", pos$])
    }
    return

  case "tail_$":
    tail_$ = value as! Slot
    return
  case "tail_":
  
    let oldValue: Any? = _tail__inited_ ? self.`tail_` : nil
    _tail__ = _tail__preSet_(oldValue, _tail__adapt_(oldValue, value))
    _tail__inited_ = true
    _tail__postSet_(oldValue, _tail__)
    if hasListeners(["propertyChange", "tail_"]) && !FOAM_utils.equals(oldValue, _tail__) {
      _ = pub(["propertyChange", "tail_", tail_$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.StringPStream"

    lazy var label: String = "String PStream"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [STR,VALUE_,POS,TAIL_,HEAD,VALID,TAIL,SUBSTRING,VALUE,SET_VALUE]

    lazy var cls: AnyClass = StringPStream.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return StringPStream(args, x)
    }

  }

}