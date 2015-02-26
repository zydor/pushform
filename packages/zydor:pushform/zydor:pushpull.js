/**
 * Created by zydor : www.zydor.eu ; thezydor@gmial.com on 13.01.15.
 * project sites:
 * http://pushform.meteor.com
 * https://github.com/zydor/pushForm
 */

//PushForm
//==============================================================================
 Template.pushForm.created = function() {
   this.pushForm = new PushForm(this);
 }

 Template.pushForm.rendered = function() {

 }

 Template.pushForm.destroyed = function() {

 }


 Template.pushForm.helpers({
   form       : function(){
     return Template.instance().pushForm.getCurrentTemplate();
   },
   input      : function(){

   },
   getFormId  : function(){
     return Template.instance().pushForm.getId();
   }
 });

 Template.pushForm.events({
   'click #pushFormSubmit': function () {
     Template.instance().pushForm.submit();
   }
 });

 var PushForm = function(template) {
   _.extend(this, new Push(template));
   this.form   = _.clone(template.data.form);
 };

 PushForm.prototype = {
   constructor          : PushForm,
   getCurrentTemplate   : function() {
      return this.form.template;
   },
   submit               : function(){
     this._validateAndGrab("insert");
   }
 }

 //PullForm
 //==============================================================================
  Template.pullForm.created = function() {
    this.pullForm = new PullForm(this);
  }

  Template.pullForm.rendered = function() {

  }

  Template.pullForm.destroyed = function() {

  }


  Template.pullForm.helpers({
    form       : function(){
      return Template.instance().pullForm.getCurrentTemplate();
    },
    input      : function(){

    },
    getFormId  : function(){
      return Template.instance().pullForm.getId();
    }
  });

  Template.pullForm.events({
    'click #pullFormSubmit': function () {
      Template.instance().pullForm.submit();
    }
  });

  var PullForm = function(template) {
    _.extend(this, new Push(template));
    _.extend(this, new DataExtractor());
    this.form   = _.clone(template.data.form);
    this._extractData();
  };

  PullForm.prototype = {
    constructor          : PullForm,
    getCurrentTemplate   : function() {
       return this.form.template;
    },
    submit               : function(){
      this._validateAndGrab("update");
    }
  }


//PushWizard
//==============================================================================
Template.pushWizard.created = function() {
  this.pushWizard = new PushWizard(this);
}

Template.pushWizard.rendered = function() {

}

Template.pushWizard.destroyed = function() {

}


Template.pushWizard.helpers({
  step : function(){
    return Template.instance().pushWizard.getCurrentStep();
  },
  navi : function(){
    return Template.instance().pushWizard.getNavigationBar();
  },
  input  : function(){

  },
  getFormId  : function(){
    return Template.instance().pushWizard.getId();
  }
});

Template.pushWizard.events({
  'click button' : function (event, template) {
    if($(event.target).hasClass(template.pushWizard.wizard.navi.buttons.previousClass)){
      template.pushWizard.setStep(template.pushWizard.getStepNo() - 1);
    }
    if($(event.target).hasClass(template.pushWizard.wizard.navi.buttons.nextClass)){
      template.pushWizard.setStep(template.pushWizard.getStepNo() + 1);
    }
  },
  'click li' : function (event, template) {
    if($(event.target).hasClass(template.pushWizard.wizard.navi.bar.stepClass)){
      $("#"+template.pushWizard.getId()+" ."+template.pushWizard.wizard.navi.bar.stepClass)
      .each(function( index , elem ) {
        if(elem === event.target) {
          template.pushWizard.setStep(index)
        }
      });
    }
  }
});

var PushWizard = function(template) {
  _.extend(this, new Push(template));
  this.mode       = "insert";
  this.wizard     = _.clone(template.data.wizard);
  this._dep       = new Tracker.Dependency();
  this._stepNo    = 0;
};

PushWizard.prototype = {
  constructor          : PushWizard,
  getNavigationBar     : function(){
    return this.wizard.navi.bar.template;
  },
  getCurrentStep       : function(){
    this._dep.depend();
    var self = this;
    self.renderSerially(function(){
      var stepNo = self.getStepNo();
      $("#"+self.getId()+" ."+self.wizard.navi.bar.stepClass)
      .removeClass(self.wizard.navi.bar.activeStepClass)
      .removeClass(self.wizard.navi.bar.completeStepCalss)
      .each(function( index , elem ) {
        if(stepNo === index){
          $(elem).addClass(self.wizard.navi.bar.activeStepClass);
        } else if(self.isStepComplete(index)) {
          $(elem).addClass(self.wizard.navi.bar.completeStepCalss);
        }
      });
    });
    Tracker.afterFlush(function(){
      self._fillData();
    });
    return this.wizard.steps[this.getStepNo()].template;
  },
  getStepNo            : function(){
    return this._stepNo;
  },
  setStep              : function(no){
    if(this._stepNo !== no && no > -1 && no < this.wizard.steps.length){

      this.wizard.steps[this.getStepNo()].complete = false;
      //validate\permit
      if(this._validateAndGrab()){
        this.wizard.steps[this.getStepNo()].complete = true;
        this._stepNo = no;
        this.hideNotyfication();
        this._dep.changed();
      } else if (this.isStepComplete(no)) {
        this._stepNo = no;
        this.hideNotyfication();
        this._dep.changed();
      }
    } else if(no == this.wizard.steps.length){
      var stepsComplete = true;
      var invalidSteps = "";
      _.each(this.wizard.steps, function(step,index){
        stepsComplete = stepsComplete && step.complete;
        if(!step.complete){
          if(invalidSteps !== ""){
            invalidSteps += ",";
          }
          invalidSteps += (index+1);
        }
      });
      if(stepsComplete){
        if(!this._validateAndGrab(this.mode)){
        }
      } else {
        this.displayNotyfication("some data in steps "+invalidSteps+" are invalid, submission stopped ",this.notyficationAlert.warning);
      }
    }
  },
  isStepComplete       : function(no){
    if(_.isUndefined(this.wizard.steps[no].complete)){
      this.wizard.steps[no].complete = false;
      return false;
    }
    if(_.isBoolean(this.wizard.steps[no].complete) && this.wizard.steps[no].complete){
      return true;
    } else {
      return false;
    }
  },
  _fillData            : function(){
    this._dep.depend();
    var self = this
    self.renderSerially(function(){
      _.each(self._fields, function(field,fieldName){
        var DOMField = $('#'+self.getId()+' *[name='+field.name+']');
        var inpContainer = new InputContainer(DOMField);
        inpContainer.setVal(field.value);
        if(!_.isUndefined(field._readOnly) && field._readOnly === true) {
          inpContainer.setReadOnly()
        }
      });
    });
  }
};


//PullWizard
//==============================================================================
Template.pullWizard.created = function() {
  this.pullWizard = new PullWizard(this);
}

Template.pullWizard.rendered = function() {

}

Template.pullWizard.destroyed = function() {

}


Template.pullWizard.helpers({
  step : function(){
    return Template.instance().pullWizard.getCurrentStep();
  },
  navi : function(){
    return Template.instance().pullWizard.getNavigationBar();
  },
  input  : function(){

  },
  getFormId  : function(){
    return Template.instance().pullWizard.getId();
  }
});

Template.pullWizard.events({
  'click button' : function (event, template) {
    if($(event.target).hasClass(template.pullWizard.wizard.navi.buttons.previousClass)){
      template.pullWizard.setStep(template.pullWizard.getStepNo() - 1);
    }
    if($(event.target).hasClass(template.pullWizard.wizard.navi.buttons.nextClass)){
      template.pullWizard.setStep(template.pullWizard.getStepNo() + 1);
    }
  },
  'click li' : function (event, template) {
    if($(event.target).hasClass(template.pullWizard.wizard.navi.bar.stepClass)){
      $("#"+template.pullWizard.getId()+" ."+template.pullWizard.wizard.navi.bar.stepClass)
      .each(function( index , elem ) {
        if(elem === event.target) {
          template.pullWizard.setStep(index)
        }
      });
    }
  }
});

var PullWizard = function(template) {
  _.extend(this, new PushWizard(template));
  _.extend(this, new DataExtractor());
  this.mode       = "update";
  var self = this;
  _.each(self.wizard.steps, function(step){
      step.complete = true;
  });
  this._extractData();
};

PullWizard.prototype = {
  constructor          : PullWizard,
}

//InputContainer
//==============================================================================
var InputContainer = function(JQueryHandler){
  this.handler = JQueryHandler;
  if(this.handler.size() > 0){
    this.tag = this.handler.prop("tagName").toLowerCase();
  }
}

InputContainer.prototype = {
  constructor          : InputContainer,
  getVal         : function(){
    if(!_.isUndefined(this.tag)){
      this._inputs[this.tag].setHandler(this.handler);
      return this._inputs[this.tag].getVal();
    }
  },
  setVal         : function(val){
    if(!_.isUndefined(this.tag)){
      this._inputs[this.tag].setHandler(this.handler);
      this._inputs[this.tag].setVal(val);
    }
  },
  setReadOnly    : function(val){
    if(!_.isUndefined(this.tag)){
      this._inputs[this.tag].setHandler(this.handler);
      this._inputs[this.tag].setReadOnly();
    }
  },
  _inputs : {
    input   : {
      setHandler     : function(handler){
        this.handler = handler;
      },
      getVal         : function(){
        return this.handler.val();
      },
      setVal         : function(val){
        this.handler.val(val);
      },
      setReadOnly    : function(val){
        this.handler.prop("readonly","readonly");
      },
    },
    select  : {
      setHandler     : function(handler){
        this.handler = handler;
      },
      getVal         : function(){
        return this.handler.val();
      },
      setVal         : function(val){
        this.handler.val(val)
      },
      setReadOnly    : function(val){
        this.handler.prop("readonly","readonly");
      },
    }
  }
}


//DataExtractor
//==============================================================================

var DataExtractor = function(template) {

};

DataExtractor.prototype = {
  constructor          : DataExtractor,
  _extractData         : function(){
    var self = this;
    self.renderSerially(function(){
      $( "#"+self.getId() ).fadeTo( 500 , 0.2, function() { });
    });
    Tracker.autorun(function () {
      self.renderSerially(function(){
        $( "#notyfication-"+self.getId() ).detach();
        $( "#"+self.getId() ).fadeTo( 0 , 0.3, function() { });
          /*function animate() {
                var $elem = $('#'+self.getId()+' .pullform-preloader');
                $({deg: 0}).animate({deg: 360}, {
                    duration: 1000,
                    step: function(now) {
                        $elem.css({
                            transform: 'rotate(' + now + 'deg)'
                        });
                    },
                    complete: function(){
                      if($( "#notyfication-"+self.getId() ).size() > 0) animate();
                    }
                });
          }
          animate();
          */
      });
    //if(!DDP._allSubscriptionsReady()){
    var collectionsReady = true;
      _.each(self.schema, function(content,collectionName){
        if(_.isUndefined(content._state)){
          content._state = {}
        }
        var collection = Meteor.getCollection(collectionName);
        var find = content._find.get();
        if(!_.isUndefined(find)) var extract = collection.findOne(find);
        if(!_.isUndefined(extract)){
          content._state.isLoaded = true;
          _.each(self._fields, function(field,fieldName){
            if(fieldName.indexOf("__") !== 0 ){
              var nesting = field.nesting.split('.');
              if(nesting[0] == collectionName){
                var fieldElement = extract;
                for(var nestLevel = 1; nestLevel < nesting.length; nestLevel++){
                  fieldElement = fieldElement[nesting[nestLevel]];
                }
                self.renderSerially(function(){
                  var elem = $('#'+self.getId()+' *[name='+field.name+']');
                  var inpContainer = new InputContainer(elem);
                  inpContainer.setVal(fieldElement);
                  if(!_.isUndefined(self._fields[fieldName]._readOnly) && self._fields[fieldName]._readOnly === true) {
                    inpContainer.setReadOnly()
                  }
                });
                self._fields[fieldName].value = fieldElement;
                self._fields[fieldName].valid = true;
              }
            }
          });
        } else {
          collectionsReady = false;
          content._state.isLoaded = false;
        }
      });
      if(collectionsReady){
        self.renderSerially(function(){
          Meteor.setTimeout(function(){
            $( "#"+self.getId() ).fadeTo( 400 , 1, function() { });
            $( "#notyfication-"+self.getId() ).fadeTo( 400 , 0, function() {
                $( "#notyfication-"+self.getId() ).detach();
            });
          }, 300);
        });
      }
    });
  }
}


//Push
//==============================================================================
/**
 * Initialize push form
 * @param {json} settings - expects settings.schema : forms data input validation, settings.steps : wizard steps templates & features
 */
var Push = function(template) {
    this._initialize(_.clone(template.data));
    this.template   = template;
    this.uiTasks    = [];
    this.id = randomString(5);
    this._createFields();
    var self = this;
    Template[template.view.template.viewName.split(".")[1]].rendered = function() {
      if (!this.rendered){
        this.rendered = true;
      }
      self.renderUiTasks();
    }
};

Push.prototype = {
    constructor : Push,
    _initialize  : function (seed) {
      this.seed = seed;
        if(!seed) {
            console.error("PushForm initiation error: seed not provided");
            return;
        }
        if(typeof seed.schema === "undefined") {
            console.error("PushForm initiation error: document data schema not provided");
            return;
        }
        this.schema = seed.schema;
        this.settings = {

        }
        this.hooks = {};
        if(_.isFunction(seed.onBeforeSubmit)){
          this.hooks.onBeforeSubmit = seed.onBeforeSubmit;
        }

        if(_.isFunction(seed.onAfterSubmit)){
          this.hooks.onAfterSubmit = seed.onAfterSubmit;
        }

        try {
            self.settings = seed.settings;
        } catch(e) {

        }
    },
    getId                 : function(){
      return this.id;
    },
    renderSerially        : function(fn){
        if(this.template.rendered){
          fn();
        } else {
          this.uiTasks.push(fn);
        }
    },
    renderUiTasks         : function(){
      var self = this;
      var fn;
      while(fn = self.uiTasks.shift()){
        fn();
      };
    },
    displayNotyfication   : function(notyfication,type){
      $("#"+this.id+" .pushform-notyfication").removeClass(this.notyficationAlert.success+" "+this.notyficationAlert.warning+" "+this.notyficationAlert.error)
      $("#"+this.id+" .pushform-notyfication").addClass(type);
      $("#"+this.id+" .pushform-notyfication").html(notyfication);
      $("#"+this.id+" .pushform-notyfication").show();
    },
    hideNotyfication      : function(){
      $("#"+this.id+" .pushform-notyfication").hide();
    },
    notyficationAlert     : {
      success : 'alert-success',
      warning : 'alert-warning',
      error   : 'alert-error'
    },
    _validationMessage    : function(DOMField,field,condition,massageType){
      if(condition){
        DOMField.addClass('validation-faild');
        if(!_.isUndefined(field.massage)){
          if(_.isString(field.massage)){
            DOMField.after('<div class="validation-faild-notyfication" >'+field.massage+'</div>');
          } else {
            DOMField.after('<div class="validation-faild-notyfication" >'+field.massage[massageType]+'</div>');
          }
        }
        return false;
      }
      return true;
    },
    _validateAndGrab      : function(mode){
      var self = this;
      $('#'+self.getId()+' .validation-faild-notyfication').detach();
      self.hideNotyfication();
      var availableFieldsValid = true;
      _.each(self._fields, function(field){
        if(!(!_.isUndefined(field._readOnly) && field._readOnly === true)) {
          field.valid = false;
          var DOMField = $('#'+self.getId()+' *[name='+field.name+']');
          if(DOMField.size() > 0){
            DOMField.removeClass('validation-faild');
            DOMField.removeClass('validation-inprogress-notyfication');
            var inpContaioner = new InputContainer(DOMField);
            var value = inpContaioner.getVal();
            var fieldValid = true;

//optional
            if(!_.isUndefined(field.optional) && !field.optional){
              fieldValid = self._validationMessage(DOMField,field,value == "","optional");
              availableFieldsValid = fieldValid && availableFieldsValid;
            }
//regex
            if(fieldValid)
            if(!_.isUndefined(field.regEx) && field.regEx){
              var patt = new RegExp(field.regEx);
              fieldValid = self._validationMessage(DOMField,field,!patt.test(value),"regEx");
              availableFieldsValid = fieldValid && availableFieldsValid;
            }
//allowedValues
            if(fieldValid)
            if(!_.isUndefined(field.allowedValues) && field.allowedValues){
              var valOccur = false
              _.each(field.allowedValues,function(input){
                if(value === input) valOccur = true;
              });
              fieldValid = self._validationMessage(DOMField,field,!valOccur,"allowedValues");
              availableFieldsValid = fieldValid && availableFieldsValid;
            }
//equal
            if(fieldValid)
            if(!_.isUndefined(field.equal) && field.equal){
              var cDOMField = $('#'+self.getId()+' *[name='+field.equal+']');
              cDOMField.removeClass('validation-faild');
              if(cDOMField.size() === 0){
                DOMField.after('<div class="validation-faild-notyfication" >field to compare do not exist</div>');
              } else {
                var cinpContaioner = new InputContainer(cDOMField);
                var cvalue = cinpContaioner.getVal();
                if(cvalue !== value){
                  cDOMField.addClass('validation-faild');
                  if(!_.isUndefined(field.massage)){
                    if(_.isString(field.massage)){
                      cDOMField.after('<div class="validation-faild-notyfication" >'+field.massage+'</div>');
                    } else {
                      cDOMField.after('<div class="validation-faild-notyfication" >'+field.massage.equal+'</div>');
                    }
                  }
                  fieldValid = false;
                }
              }
              availableFieldsValid = fieldValid && availableFieldsValid;
            }
//uniq in db
/*
            if(!_.isUndefined(field.uniqe) && field.uniqe && fieldValid){
              fieldValid = false;
              DOMField.addClass('validation-inprogress-notyfication');
              DOMField.after('<div class="validation-inprogress-notyfication" ></div>');
              if(_.isString(field.massage.uniqeInProgress)){
                DOMField.after('<div class="validation-inprogress-notyfication" >'+field.massage.uniqeInProgress+'</div>');
              } else {
                DOMField.after('<div class="validation-inprogress-notyfication" >checking database uniqueness</div>');
              }
              var collectionName = field.nesting.split(".")[0];
              collectionName.length
              var condition = new Object();
              condition[field.nesting.substr(collectionName.length + 1, field.nesting.length)] = value ;
              Meteor.call("checkIfexist",[condition,collectionName],function(err,res){
                DOMField.removeClass('validation-inprogress-notyfication');
                DOMField.next().detach();
                if(_.isUndefined(err)){
                  console.log(res)
                  fieldValid = self._validationMessage(DOMField,field,res,"uniqe");
                  console.log("uniq: "+fieldValid)
                  availableFieldsValid = fieldValid && availableFieldsValid;
                  if(self._allFieldsValid()){
                    console.log("bob 2")
                    self._pushProcess(mode);
                  }
                } else {
                  console.error("Error while uniq checking")
                  console.error(err)
                }
              });
              availableFieldsValid = fieldValid && availableFieldsValid;
            }
*/
            field.valid = fieldValid;
            field.value = value;
          }
        }
      });
      if(_.isUndefined(mode)){
        return availableFieldsValid;
      }

      if(self._allFieldsValid()){
        self._pushProcess(mode);
      } else {
        self.displayNotyfication("form not valid",self.notyficationAlert.warning)
      }
    },
    _pushProcess             : function(mode){
      var pushPermission = true;
      if(_.isFunction(this.hooks.onBeforeSubmit)){
        var beforeOutput = this.hooks.onBeforeSubmit();
        if(_.isUndefined(beforeOutput)) console.error("pushForm: did you forget return statement in onBeforeSubmit() hook ?");
        if(!beforeOutput){
          pushPermission = false;
        }
      }
      if(pushPermission){
        switch(mode){
          case "insert" :
              this._insertData();
            break;
          case "update" :
              this._updateData();
            break;
        }
      }
      if(_.isFunction(this.hooks.onAfterSubmit)){
        this.hooks.onAfterSubmit();
      }
    },
    _allFieldsValid          : function(){
      var valid = true;
      _.each(this._fields, function(field){
        if(!_.isUndefined(field.name)){
          if(!(!_.isUndefined(field._readOnly) && field._readOnly === true)) {
            if(_.isUndefined(field.valid) ) field.valid = false;
              valid = field.valid && valid;
          }
        }
      });
      return valid;
    },
    _insertData              : function(){
      var self = this;
      self.renderSerially(function(){
        $( "#"+self.getId() ).fadeTo( 500 , 0.3, function() { });
          function animate() {
                var $elem = $('#'+self.getId()+' .pullform-preloader');
                $({deg: 0}).animate({deg: 360}, {
                    duration: 1000,
                    step: function(now) {
                        $elem.css({
                            transform: 'rotate(' + now + 'deg)'
                        });
                    },
                    complete: function(){
                      animate();
                    }
                });
          }
          animate();
      });
      _.each(self.schema, function(content,collectionName){
        var collection = Meteor.getCollection(collectionName);
        var collectionInput = {};
        _.each(self._fields, function(field,fieldName){
          if(fieldName.indexOf("__") !== 0 ){
            var nesting = field.nesting.split('.');
            if(nesting[0] === collectionName){
                var root = {};
                var nestingObj = self._recursiveNest(root,root,field.value,nesting,1);
                self._mergeDeep(collectionInput, nestingObj);
            }
          }
        });
        var documentId = collection.insert(collectionInput,function(err,res){
          if(!_.isUndefined(err) ){
              self.displayNotyfication(res,self.notyficationAlert.error);
          }
        });
      });

      self.renderSerially(function(){
        Meteor.setTimeout(function(){
          $( "#"+self.getId() ).fadeTo( 500 , 1, function() { });
          $( "#notyfication-"+self.getId() ).fadeTo( 500 , 0, function() {
              $( "#notyfication-"+self.getId() ).detach();
          });
        }, 1000);
      });

    },
    _updateData              : function(){
      var self = this;
      self.renderSerially(function(){
        $( "#"+self.getId() ).fadeTo( 500 , 0.3, function() { });
          function animate() {
                var $elem = $('#'+self.getId()+' .pullform-preloader');
                $({deg: 0}).animate({deg: 360}, {
                    duration: 1000,
                    step: function(now) {
                        $elem.css({
                            transform: 'rotate(' + now + 'deg)'
                        });
                    },
                    complete: function(){
                      animate();
                    }
                });
          }
          animate();
      });
      _.each(self.schema, function(content,collectionName){
        var collection = Meteor.getCollection(collectionName);
        var collectionInput = {};
        _.each(self._fields, function(field,fieldName){
          if(field._readOnly !== true && fieldName.indexOf("__") !== 0 ) {
            var nesting = field.nesting.split('.');
            if(nesting[0] === collectionName){
                var root = {};
                var nestingObj = self._recursiveNest(root,root,field.value,nesting,1);
                self._mergeDeep(collectionInput, nestingObj);
            }
          }
        });
        var find = content._find.get();
        var documentId = collection.update(find,{ $set : collectionInput },function(err,res){
          if(!_.isUndefined(err) ){
              self.displayNotyfication(res,self.notyficationAlert.error);
          }
        });

      });
      self.renderSerially(function(){
        Meteor.setTimeout(function(){
          $( "#"+self.getId() ).fadeTo( 500 , 1, function() { });
          $( "#notyfication-"+self.getId() ).fadeTo( 500 , 0, function() {
              $( "#notyfication-"+self.getId() ).detach();
          });
        }, 1000);
      });
    },
    _recursiveNest        : function(root,node,top,nesting,level){
      if(nesting.length === (level + 1)){
        node[nesting[level]] = top;
        return root;
      } else if(nesting.length > level){
        node[nesting[level]] = {};
        var subNode = node[nesting[level]];
        level += 1;
        return this._recursiveNest(root,subNode,top,nesting,level)
      }
      return root;
    },
    _mergeDeep            : function(o1, o2) {
      var tempNewObj = o1;
      var self = this;
      if (o1.length === undefined && typeof o1 !== "number" && typeof o1 !=="boolean") {
        $.each(o2, function(key, value) {
          if (o1[key] === undefined) {
            tempNewObj[key] = value;
          } else {
            tempNewObj[key] = self._mergeDeep(o1[key], o2[key]);
          }
        });
      }
      else if (o1.length > 0 && typeof o1 !== "string") {
        $.each(o2, function(index) {
          if (JSON.stringify(o1).indexOf(JSON.stringify(o2[index])) === -1) {
            tempNewObj.push(o2[index]);
          }
        });
      }
      else {
        tempNewObj = o2;
      }
      return tempNewObj;
    },
    _createFields         : function(){
      var self = this;
      if(!_.isObject(this._fields)){
        this._fields = {
          __formId : this.id
        };
        _.each(self.schema, function(node,nodeName){
          var nesting = "";
          self._recursiveTraverse(node,nodeName,nesting);
        });
      }
    },
    _recursiveTraverse    : function(node,nodeName,nesting){
      var self = this;
      var nestingMarked = false;
      _.find(node, function(subNode,subNodeName){
        if(_.isObject(subNode) && !_.isArray(subNode) && !_.isFunction(subNode) && (subNodeName.indexOf("_") == 0)) {
          //DO NOTHING WHILE SPECIAL setup Object WHERE FOUND
        } else if(_.isObject(subNode) && !_.isArray(subNode) && !_.isFunction(subNode)){
          if(!nestingMarked){
            if(nesting) nesting += ".";
            nesting += nodeName;
            nestingMarked = true;
          }
          self._recursiveTraverse(subNode,subNodeName,nesting);
        } else {
          self._fields[nodeName] = _.clone(node);
          self._fields[nodeName].nesting = nesting += "."+nodeName;
          return true;
        }
      });
    }
}

var randomString = function(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
