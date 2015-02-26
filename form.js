if (Meteor.isClient) {


    var username = {
      name        : "username",
      inputType   : String,
      uniqe       : true,
      optional    : false,
      massage     : {uniqe : "must be uniqe in database",uniqeInProgress : "checking if username if free...", optional : "username is required"}
    };
    var email = {
      name        : "email",
      uniqe       : true,
      regEx       : "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$",
      inputType   : String,
      optional    : false,
      massage     : {uniqe : "must be uniqe in database", optional : "email is required",regEx : "is not valid email address"}
    };
    var password = {
      name        : "password",
      equal       : "repPassword",
      inputType   : String,
      optional    : false,
      massage     : {equal : "password repeated incorrectly", optional : "password is required"}
    };
    var firstName = {
      name        : "firstName",
      inputType   : String,
      optional    : false,
      massage     : "neme is required"
    };
    var surName = {
      name        : "surName",
      inputType   : String,
      optional    : false,
      massage     : "surname is required"
    };
    var city = {
      name        : "city",
      inputType   : String,
      optional    : false,
      massage     : "bob"
    };
    var suburb = {
      name        : "suburb",
      inputType   : String,
      optional    : true,
      massage     : "bob"
    };
    var street = {
      name        : "street",
      inputType   : String,
      optional    : true,
      massage     : "bob"
    };
    var sex = {
      name        : "sex",
      allowedValues: ['Male', 'Female'],
      optional    : false,
      massage     : {allowedValues : "provided sex is not valid", optional : "pleas select your sex"}
    };

    var Seed         = {};

    Seed.schema  = {
      CollectionUsers : {
        identity : {
          username  : username,
          email     : email,
          password  : password
        },
        personal : {
          firstName : firstName,
          surName   : surName,
          address : {
            city    : city,
            suburb  : suburb,
            street  : street
          },
          sex       : sex
        }
      },
//      CollectionName2 : {
//        //input7 : input7
//      }
    };


    Seed.onBeforeSubmit = function(){
      console.log("before submint pull");
      return true;
    }

    Seed.onAfterSubmit = function(){
      console.log("after submit pull");
    }


Template.form.helpers({
  seed : function() {
    var seed = JSON.parse(JSON.stringify(Seed));
    seed.form = {
      template : "submitForm"
    }

    return seed;
  }
});

Template.editor.helpers({
  seed : function() {
    var seed = JSON.parse(JSON.stringify(Seed));
    seed.schema.CollectionUsers.identity.username._readOnly  = true;
    seed.schema.CollectionUsers.identity.email._readOnly     = true;
    seed.schema.CollectionUsers.identity.password._readOnly  = true;
    seed.form = {
      template : "editForm"
    }

    seed.schema.CollectionUsers._find = new ReactiveVar();
    //seed.schema.CollectionName2._find = new ReactiveVar();
    //seed.schema.CollectionUsers._find.set({
    //  _id : CollectionUsers.findOne()._id
    //});

    //seed.schema.CollectionName2._find.set({
    //  _id : CollectionName2.findOne()._id
    //});

    Template.instance().seed = seed;
    return seed;
  },
  userCollection : function(){
    return CollectionUsers.find();
  },
  documentToString : function(document){
    return JSON.stringify(document);
  }
});

Template.editor.events({
  'click a' : function (event, template) {
    var target = event.currentTarget;
    $(".list-group-item").removeClass("active");
    $(target).addClass("active");
    template.seed.schema.CollectionUsers._find.set({
      _id : this._id
    });
  },
});

Template.wizard.helpers({
  seed : function() {
    var seed = JSON.parse(JSON.stringify(Seed));
    seed.wizard = {
      steps : [
        {
          template : "wizardStep1"
        },
        {
          template : "wizardStep2"
        },
        {
          template : "wizardStep3"
        },
      ],
      navi : {
        bar : {
            template          : "wizardNavi",
            stepClass         : "wizard-step",
            activeStepClass   : "active",
            completeStepCalss : "complete"
        },
        buttons : {
            nextClass       : "wizard-next",
            previousClass   : "wizard-previous" ,

        }
      }
    }

    return seed;
  }
});


Template.wizardEditor.helpers({
  seed : function() {
    var seed = JSON.parse(JSON.stringify(Seed));
    seed.schema.CollectionUsers.identity.username._readOnly  = true;
    seed.schema.CollectionUsers.identity.email._readOnly     = true;
    seed.schema.CollectionUsers.identity.password._readOnly  = true;

    seed.schema.CollectionUsers._find = new ReactiveVar();
    //seed.schema.CollectionName2._find = new ReactiveVar();
    //seed.schema.CollectionUsers._find.set({
    //  _id : "mr4o6dMYLPRoLshRS"
    //});

    //seed.schema.CollectionName2._find.set({
    //  _id : "kJeMayNJvZxSeJwhm"
    //});


    seed.wizard = {
      steps : [
        {
          template : "ewizardStep1"
        },
        {
          template : "ewizardStep2"
        },
        {
          template : "ewizardStep3"
        },
      ],
      navi : {
        bar : {
            template          : "ewizardNavi",
            stepClass         : "wizard-step",
            activeStepClass   : "active",
            completeStepCalss : "complete"
        },
        buttons : {
            nextClass       : "wizard-next",
            previousClass   : "wizard-previous" ,

        }
      }
    }
    Template.instance().seed = seed;
    return seed;
  },
  userCollection : function(){
    return CollectionUsers.find();
  },
  documentToString : function(document){
    return JSON.stringify(document);
  }
});

Template.wizardEditor.events({
  'click a' : function (event, template) {
    var target = event.currentTarget;
    $(".list-group-item").removeClass("active");
    $(target).addClass("active");
    template.seed.schema.CollectionUsers._find.set({
      _id : this._id
    });
  },
});



}
