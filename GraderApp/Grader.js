Courses  = new Mongo.Collection("courses");
Criteria = new Mongo.Collection("criteria")



  if (Meteor.isClient) {

  Template.body.helpers({
    courses: function () {
      return Courses.find({});
    }
  });

  Template.course.helpers({
    criteria: function () {
      return this.criteria;
    }
  })

  Template.critItem.helpers({
    text : function() {
      return this
    }
  })



  Template.body.events({

    "submit .new-course": function (event) {
      var text = event.target.text.value;
      Courses.insert({
        text: text,
        createdAt: new Date(),
        criteria : []
      });
      event.target.text.value = "";
        return false;
      }

  });

  Template.course.events({
    "click .delete": function () {
       Courses.remove(this._id);
     },
    "submit .new-criteria" : function (event) {
      event.preventDefault();

      var newCriteria = {
        text:    event.target.inputCriteria.value,
        parent:  this._id,
        weight:  event.target.inputPercent.value
      }

      var crits  = this.criteria;
      crits.push(newCriteria);
      Courses.update(this._id, {$set: { criteria: crits }})
    }
  })

  Template.critItem.events({
    "click .delete": function () {
      var crit = Courses.find(this.parent).fetch()[0].criteria
      for (var i = 0; i<crit.length; i++) {
        if (crit[i]=this) {
          crit.splice(i,1);
          i=crit.length;
        }
      }
      Courses.update(this.parent, {$set: { criteria: crit }})
    }
  })

};
