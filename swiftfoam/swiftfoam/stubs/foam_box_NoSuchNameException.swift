// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class NoSuchNameException: AbstractFObject, Error {

  public var name: String {
    get {
      
if _name_inited_ {
  return _name_!
}

return ""

      
    }
set(value) {
      
self.set(key: "name", value: value)
      
    }
  }

  var _name_: String! = nil

  var _name_inited_: Bool = false

  public static let NAME: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "name"
  let classInfo: ClassInfo
  let transient = false
  let label = "Name" // TODO localize
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

  private lazy var name_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "name",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var name_Value_Sub_: Subscription?

  public var name$: Slot {
    get {
      return self.name_Value_
    }
set(value) {
      
self.name_Value_Sub_?.detach()
self.name_Value_Sub_ = self.name$.linkFrom(value)
self.onDetach(self.name_Value_Sub_!)
      
    }
  }

  public var message: String {
    get {
      
if _message_inited_ {
  return _message_!
}

if _message_expression_ != nil { return _message_ }
let valFunc = { () -> String! in
  
  let name = self.name
  
  return "Could not find registration for " + name
}
let detach: Listener = { _,_ in
  if self._message_expression_ == nil { return }
  for s in self._message_expression_! {
    s.detach()
  }
  self._message_expression_ = nil
  self.clearProperty("message")
}
_message_expression_ = [
  
  name$.swiftSub(detach),
  
]
_message_ = valFunc()
return _message_!

      
    }
set(value) {
      
self.set(key: "message", value: value)
      
    }
  }

  var _message_expression_: [Subscription]?

  var _message_: String! = nil

  var _message_inited_: Bool = false

  public static let MESSAGE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "message"
  let classInfo: ClassInfo
  let transient = true
  let label = "Message" // TODO localize
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

  private lazy var message_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "message",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var message_Value_Sub_: Subscription?

  public var message$: Slot {
    get {
      return self.message_Value_
    }
set(value) {
      
self.message_Value_Sub_?.detach()
self.message_Value_Sub_ = self.message$.linkFrom(value)
self.onDetach(self.message_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_name_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_name_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_name_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_message_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_message_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_message_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return NoSuchNameException.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return NoSuchNameException.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "name":
    _name_inited_ = false
    _name_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "name"]) {
      _ = pub(["propertyChange", "name", name$])
    }
    break

  case "message":
    _message_inited_ = false
    _message_ = nil

  
    if _message_expression_ != nil {
      for s in self._message_expression_! { s.detach() }
    }
    _message_expression_ = nil
  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "message"]) {
      _ = pub(["propertyChange", "message", message$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "name": return `_name_inited_`

  case "message": return `_message_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "name": return `name`

  case "message": return `message`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "name": return `name$`

  case "message": return `message$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "name$":
    name$ = value as! Slot
    return
  case "name":
  
    let oldValue: Any? = _name_inited_ ? self.`name` : nil
    _name_ = _name_preSet_(oldValue, _name_adapt_(oldValue, value))
    _name_inited_ = true
    _name_postSet_(oldValue, _name_)
    if hasListeners(["propertyChange", "name"]) && !FOAM_utils.equals(oldValue, _name_) {
      _ = pub(["propertyChange", "name", name$])
    }
    return

  case "message$":
    message$ = value as! Slot
    return
  case "message":
  
    if _message_expression_ != nil {
      for s in self._message_expression_! { s.detach() }
    }
  
    let oldValue: Any? = _message_inited_ ? self.`message` : nil
    _message_ = _message_preSet_(oldValue, _message_adapt_(oldValue, value))
    _message_inited_ = true
    _message_postSet_(oldValue, _message_)
    if hasListeners(["propertyChange", "message"]) && !FOAM_utils.equals(oldValue, _message_) {
      _ = pub(["propertyChange", "message", message$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.NoSuchNameException"

    lazy var label: String = "No Such Name Exception"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [NAME,MESSAGE]

    lazy var cls: AnyClass = NoSuchNameException.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return NoSuchNameException(args, x)
    }

  }

}