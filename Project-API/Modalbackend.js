const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors=require('cors');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/Todo', {
    useNewUrlParser: true
});

const apiSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    completedOn: {
        type: Date,
        default: Date.now,
        required: true
    },
    
});

const api_model = mongoose.model("person", apiSchema);

app.post("/addTodo", (req, res) => {
    const new_api = new api_model({
        title: req.body.title,
        description: req.body.description,
    });

    new_api.save()
        .then(() => {
            res.send("added Successfully");
        })
        .catch((error) => {
            res.status(500).send({
                message: "Error saving data to the database",
                error: error
            });
        });
});

app.put("/completed/:id", (req, res) => {
    const id = req.params.id;
    const currentDate = new Date();
    const options = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    const completedOn = currentDate.toLocaleString("en-US", options);
  
    api_model
      .findByIdAndUpdate(id, { completedOn: currentDate }, { new: true })
      .then((updatedTodo) => {
        if (!updatedTodo) {
          res.status(404).send({
            message: `Cannot find Todo with id=${id}.`,
          });
        } else {
          res.send({
            message: "Todo marked as completed successfully.",
            updatedTodo
          });
        }
      })
      .catch((error) => {
        res.status(500).send({
          message: `Error marking Todo with id=${id} as completed.`,
          error: error.message,
        });
      });
  });

  app.get('/getusers', async (request, response) => {
   let user=await api_model.find()
 try {
    if (user) {
        response.status(200).json(user)

    }
 } catch (error) {
    response.status(500).json(error)

 }
    
});

app.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id," delete id")
    api_model.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Tutorial with id=${id}.Maybe Tutorial was not found!`
                });
            } else {
                res.send({
                    message: " deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Tutorial with id=" + id
            });
        });
});

app.put("/update/:id", (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });    
    }

    const id = req.params.id;
    api_model.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Tutorial with id=${id}.Maybe Tutorial was not found!`
                });
            } else {
                // res.send({ message: " updated successfully." });
                res.status(200).json({data})
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Tutorial with id=" + id
            });
        });
});

app.listen(5000);
