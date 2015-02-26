
var Global = this;

Meteor.getCollection = function (name){
    for (var globalObject in Global) {
      if (Global[globalObject] instanceof Meteor.Collection) {
        if (globalObject === name) {
          return (Global[globalObject]);
          break;
        };
      }
    }
    return undefined;
}
