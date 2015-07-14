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
    },
    avg: function () {
      return this.average
    }
  })

  Template.critItem.helpers({
    text : function() {
      return this
    }




  })

  function average(array) {
    var sum = 0;
    //console.log(array)
    for (var i=0; i<array.length; i++) {
      sum+=1*array[i].text;
    }
    
    result = Math.floor(sum/array.length);
    
    if (isNaN(result)) {
      return "-"
    }

    return result

  }

  function findWeightedAvg(criteriaArray) {
    var num=0;
    var den=0;

    for (var i=0; i<criteriaArray.length; i++) {
      if (typeof criteriaArray[i].critAvg==="number") {
      num+= 1*criteriaArray[i].critAvg*criteriaArray[i].weight
      den+= 1*criteriaArray[i].weight;
      }
    }

    if (den===0) {return "-"}
    else {return Math.round(num/den) }

  }

  Template.body.events({

    "submit .new-course": function (event) {
      var text = event.target.text.value;
      Courses.insert({
        text: text,
        createdAt: new Date(),
        criteria : [],
        weightedAvg: ""
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

      event.target.inputCriteria.value = ""
      event.target.inputPercent.value = ""
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

      var wAvg = findWeightedAvg(crit)
      Courses.update(this.parent, {$set: { criteria: crit,
                                            weightedAvg: wAvg
                                                         }})
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

     var avg = average(gradesArray)
     console.log(avg)

     

     gp[0].criteria[thisIndex].grades = gradesArray;
     newCriteria = gp[0].criteria
     newCriteria[thisIndex].critAvg = avg;

     Courses.update(newGrade.grandparent, {$set: { criteria: newCriteria }})
     
     gp = Courses.find(newGrade.grandparent).fetch()
     
     var wAvg = findWeightedAvg(gp[0].criteria)

     Courses.update(newGrade.grandparent, {$set: { weightedAvg: wAvg }})
     event.target.gradeInput.value=''

     //Template.critItem.rendered();
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

      debugger;
      crit[critIndex].critAvg = average(crit[critIndex].grades);
      

      var wAvg = findWeightedAvg(crit)
      Courses.update(this.grandparent, {$set: { criteria: crit, weightedAvg: wAvg }})

    }

  })

};
