import express from "express";
import bodyParser from "body-parser";
import { getDate, getDay } from "./date.js";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://subhamchowdhury1025:subham709@cluster0.nx1k8wg.mongodb.net/toDoListDB");

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist.",
});

const item2 = new Item({
  name: "Hit the + button to add new items.",
});

const item3 = new Item({
  name: "<-------Hit to Delete.",
});

const defaltItems = [item1, item2, item3];

// Item.insertMany([item1, item2, item3])
//   .then(() => {
//     console.log("Success");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (foundList) {
        res.render("list.ejs", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      } else {
        const list = new List({
          name: customListName,
          items: defaltItems,
        });

        list.save();
        res.redirect("/" + customListName);
        res.redirect("/" + customListName);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/", (req, res) => {
  const day = getDate();
  Item.find()
    .then((items) => {
      res.render("list.ejs", { listTitle: day, newListItems: items });
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName == getDate()) {
    item.save();
    res.redirect("/");
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", (req, res) => {
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName == getDate()) {
    Item.findByIdAndDelete(deleteId)
      .then(() => {
        res.redirect("/");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      {
        name: listName,
      },
      {
        $pull: {
          items: {
            _id: deleteId,
          },
        },
      }
    ).then(() => {
      res.redirect("/" + listName);
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
