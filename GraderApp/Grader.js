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

  Template.critItem.onRendered({
    setAvg: function() {
      console.log("Rendered")
      var sum = 0
      for (var i =0; i < this.grades.length; i++) {
        sum+=grades[text]*1;
      }
      if (this.grades.length<1) {
        this.avg="-"
      }
      else {
        this.avg=sum/this.length;
      }
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
        weight:  event.target.inputPercent.value,
        grades:  [],
        critAvg: "-"
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
    },
   "submit" : function (event) {
     event.preventDefault();

     var newGrade = {
       text: event.target.gradeInput.value,
       grandparent: this.parent,
       parentText: this.text
     }

     var gp = Courses.find(newGrade.grandparent).fetch()
     crit = gp[0].criteria;
     var thisIndex
     for (var i=0; i<crit.length; i++) {
       if (JSON.stringify(crit[i])===JSON.stringify(this)) {
         thisIndex = i;
       }
     }

     if (thisIndex===undefined) {
       var gradesArray = [newGrade];
     }
     else {
       var gradesArray  = Courses.find(newGrade.grandparent).fetch()[0].criteria[thisIndex].grades
       gradesArray.push(newGrade);
     }

     gp[0].criteria[thisIndex].grades = gradesArray;
     newCriteria = gp[0].criteria

     Courses.update(newGrade.grandparent, {$set: { criteria: newCriteria }})
   }
  })

  Template.grade.events({
    "click .deleteGrade": function (event) {
      event.preventDefault;
      var crit  = Courses.find(this.grandparent).fetch()[0].criteria
      var critIndex;
      for (var i = 0; i<crit.length; i++) {
        if (crit[i].text===this.parentText) {
          critIndex=i;
          i=crit.length;
        }
      }

      grades2 = crit[critIndex].grades

      var gradeIndex
      for (var i = 0; i<grades2.length; i++) {
        if (JSON.stringify(grades2[i])===JSON.stringify(this)) {
          gradeIndex=i;
        }
      }


     grades2.splice(gradeIndex,1)


      crit[critIndex].grades = grades2
      //crit.splice(critIndex,1,grades)


      Courses.update(this.grandparent, {$set: { criteria: crit }})

    }

  })

};
