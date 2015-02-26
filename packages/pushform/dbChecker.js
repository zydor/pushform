
Meteor.methods({
  checkIfexist: function (params) {
    var collection = Meteor.getCollection(params[1]);
    var doc = collection.findOne(params[0]);
    if(doc)
      return true;
    else
      return false;
  },
});
