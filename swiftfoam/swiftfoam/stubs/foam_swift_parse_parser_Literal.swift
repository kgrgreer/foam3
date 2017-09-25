// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Literal: AbstractFObject, Parser {

  public var string: String {
    get {
      
if _string_inited_ {
  return _string_!
}

return ""

      
    }
set(value) {
      
self.set(key: "string", value: value)
      
    }
  }

  var _string_: String! = nil

  var _string_inited_: Bool = false

  public static let STRING: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "string"
  let classInfo: ClassInfo
  let transient = false
  let label = "String" // TODO localize
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

  private lazy var string_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "string",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var string_Value_Sub_: Subscription?

  public var string$: Slot {
    get {
      return self.string_Value_
    }
set(value) {
      
self.string_Value_Sub_?.detach()
self.string_Value_Sub_ = self.string$.linkFrom(value)
self.onDetach(self.string_Value_Sub_!)
      
    }
  }

  public var value: Any? {
    get {
      
if _value_inited_ {
  return _value_
}

if _value_expression_ != nil { return _value_ }
let valFunc = { () -> Any? in
  
  let string = self.string
  
  return string
}
let detach: Listener = { _,_ in
  if self._value_expression_ == nil { return }
  for s in self._value_expression_! {
    s.detach()
  }
  self._value_expression_ = nil
  self.clearProperty("value")
}
_value_expression_ = [
  
  string$.swiftSub(detach),
  
]
_value_ = valFunc()
return _value_

      
    }
set(value) {
      
self.set(key: "value", value: value)
      
    }
  }

  var _value_expression_: [Subscription]?

  var _value_: Any? = nil

  var _value_inited_: Bool = false

  public static let VALUE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "value"
  let classInfo: ClassInfo
  let transient = false
  let label = "Value" // TODO localize
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

  private lazy var value_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "value",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var value_Value_Sub_: Subscription?

  public var value$: Slot {
    get {
      return self.value_Value_
    }
set(value) {
      
self.value_Value_Sub_?.detach()
self.value_Value_Sub_ = self.value$.linkFrom(value)
self.onDetach(self.value_Value_Sub_!)
      
    }
  }

  lazy var parse$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let ps = args[0] as! PStream

    let x = args[1] as! ParserContext

    
    return self!.`parse`(
        _: ps, _: x)
  }
])
      
  }()

  public static let PARSE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parse"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_string_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_string_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_string_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_value_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var ps = ps
for i in 0..<string.characters.count {
  if !ps.valid() || ps.head() != string.char(at: i) {
    return nil
  }
  ps = ps.tail()
}
return ps.setValue(self.value)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Literal.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Literal.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "string":
    _string_inited_ = false
    _string_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "string"]) {
      _ = pub(["propertyChange", "string", string$])
    }
    break

  case "value":
    _value_inited_ = false
    _value_ = nil

  
    if _value_expression_ != nil {
      for s in self._value_expression_! { s.detach() }
    }
    _value_expression_ = nil
  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "value"]) {
      _ = pub(["propertyChange", "value", value$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "string": return `_string_inited_`

  case "value": return `_value_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "string": return `string`

  case "value": return `value`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "string": return `string$`

  case "value": return `value$`


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "string$":
    string$ = value as! Slot
    return
  case "string":
  
    let oldValue: Any? = _string_inited_ ? self.`string` : nil
    _string_ = _string_preSet_(oldValue, _string_adapt_(oldValue, value))
    _string_inited_ = true
    _string_postSet_(oldValue, _string_)
    if hasListeners(["propertyChange", "string"]) && !FOAM_utils.equals(oldValue, _string_) {
      _ = pub(["propertyChange", "string", string$])
    }
    return

  case "value$":
    value$ = value as! Slot
    return
  case "value":
  
    if _value_expression_ != nil {
      for s in self._value_expression_! { s.detach() }
    }
  
    let oldValue: Any? = _value_inited_ ? self.`value` : nil
    _value_ = _value_preSet_(oldValue, _value_adapt_(oldValue, value))
    _value_inited_ = true
    _value_postSet_(oldValue, _value_)
    if hasListeners(["propertyChange", "value"]) && !FOAM_utils.equals(oldValue, _value_) {
      _ = pub(["propertyChange", "value", value$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Literal"

    lazy var label: String = "Literal"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [STRING,VALUE,PARSE]

    lazy var cls: AnyClass = Literal.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Literal(args, x)
    }

  }

}