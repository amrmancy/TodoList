const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose= require("mongoose");
const _=require("lodash");
// const date= require(__dirname+"/Date.js");     // to import the object Date.js

app.set('view engine', 'ejs'); // to use ejs
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //to make the files (css file & imgs) static to be used in express 


//DB connection


  mongoose.set('strictQuery',false);                                        // to prevent deprecation error             
  mongoose.connect('mongodb+srv://admin-amr:01098174232@amr.xhnuszx.mongodb.net/todoListDB');                 // the connection
  console.log("Connected to database");                                     //msg

const itemsSchema ={                     //creating a Schema
  name:String
};
const Item= mongoose.model("Item",itemsSchema);                //creating a Model based on the Schema (Single)



const item1=new Item({
  name:"1-Welcome to your todo List.!"
});
const item2=new Item({
  name:"2-Welcome to your todo List.!"
});
const item3=new Item({
  name:"3-Welcome to your todo List.!"
}); 

const defaultItems=[item1,item2,item3]; 

const listSchema={
name:String,
items:[itemsSchema]
};

const List= mongoose.model("List",listSchema)


/* use database instead of the arrays

const items=["Buy Food","Cook Food","Eat Food"];
const workItems=[]; */ // setting an Array to const means you can normal delete or push to it but you can't assign it to something else



app.get("/", function(req, res) {
// using the function of the module we imported from the object Date.js 
//let day = date.getDate(); // now if the object has two functions you have to specify which function you are going to use

Item.find({},function(err, foundItems){
  if (foundItems.length===0) {
      Item.insertMany(defaultItems,function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("data was inserted successfully!");
        }
      });
      res.redirect("/");
 
  } else {
    res.render("list", {listTitle: "Today", NewListItems: foundItems}) // with the ejs file to render the variable in the template, it has all variable among them a ","
  }
  });
  });

app.get("/:customListName", function(req,res) {
 const customListName =_.capitalize(req.params.customListName); //capitalizes the list name
List.findOne({name:customListName},function (err,foundList) {
  if(!err){
    if(!foundList){

      const list=new List({
        name:customListName,
        items:defaultItems
       })
       list.save();
       res.redirect("/"+customListName);

    }else{
      res.render("list",{listTitle: foundList.name, NewListItems: foundList.items})
    }
  }
})
})










app.post("/",function(req,res){

  const itemName =req.body.newItem;
  const listName=req.body.list;
  const item= new Item({
    name:itemName
  });
 
  if (listName==="Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
    
  }


  

});

app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;

  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted checked item.")
        res.redirect("/");
      }
    });
    
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if (!err) {
        res.redirect("/"+listName);
      }
    })
    
  }
 
});











  
//this whole function is just to get the the input from the user, and redirect to homePage
/* app.post("/",function(req,res){

  let item =req.body.newItem;

  if (req.body.list === "Work")
  {
    workItems.push(item);
    res.redirect("/work");
  }else{
    items.push(item);
    res.redirect("/");
  }

})
*/

/*

app.get("/about",function(req,res){
  res.render("about")
})
*/




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);







app.listen(port, function() {
  console.log("server has started successfully.")
})
