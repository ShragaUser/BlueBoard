import { Router } from "express";
import { ObjectID } from 'mongodb';
import {
  ADMIN_ROLE,
  READ_WRITE_ROLE,
  PUBLIC_USER_PROPERTIES
} from "../../constants";
import { pick } from "../helper";
import { transformUser } from "../../app/components/utils";

const api = db => {
  const router = Router();
  const boards = db.collection("boards");
  const users = db.collection("users");
  const history = db.collection("history");
  const notifications = db.collection("notifications");

  // Replace the entire board every time the users modifies it in any way.
  // This solution sends more data than necessary, but cuts down on code and
  // effectively prevents the db and client from ever getting out of sync
  router.put("/board", (req, res) => {
    let { boardData: board } = req.body;
    board = { ...board, changed_by: req.user._id };
    // Update the board only if the user's role in the board is admin/read-write
    boards
      .updateOne(
        {
          _id: board._id
        },
        { $set: board },
        { upsert: true }
      )
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        // 11000 - MongoDB duplicate error - AKA the user don't have permissions for the board
        if (err.code === 11000) {
          res.status(403).send("You don't have permissions for this board");
        } else {
          console.error(err);
          res.status(500).send("Error");
        }
      });
  });

  router.post("/history", (req, res) => {
    const { body: historyObj } = req;
    history
      .insert({ ...historyObj, date: new Date() })
      .then(result => {
        res.status(200).send();
      })
      .catch(err => {
        res.status(500).send("Error");
      });
  });

  router.post("/history/getByBoardId", (req, res) => {
    const { id, skip, limit } = req.body;
    history
      .find({ boardId: id }, "-_id -payload").hint({ $natural: -1 }).skip(skip).limit(limit)
      .toArray()
      .then(histories => {
        res.json(histories.map(hist => ({ ...hist, payload: undefined })));
      });
  });

  router.post("/notifications", (req, res) => {
    const { body: notification } = req;
    const notificationWithWasSeen = { ...notification, 'wasSeen': false };
    notifications
      .insert(notificationWithWasSeen)
      .then(result => {
        res.status(200).send();
      })
      .catch(err => {
        res.status(500).send("Error");
      });
  });


  router.post("/notifications/changeWasSeen", (req, res) => {
    const { _id } = req.body;
    notifications
      .findOneAndUpdate(
        { _id: ObjectID(_id) },
        { $set: { 'wasSeen': true } })
      .then(() => {
        res.status(200).send();
      })
  })


  router.post("/notifications/getByUserId", (req, res) => {
    let { id } = req.body;

    notifications
      .find({ notifTo: id })
      .toArray()
      .then(notifs => {
        res.json(notifs);
      })
  })

  router.delete("/notifications", (req, res) => {
    const { _id } = req.body;
    notifications.deleteOne({ _id: new ObjectID(_id) }).then(() => {
      res.status(200).send();
    });
  });

  router.delete("/board", (req, res) => {
    const { boardId } = req.body;
    // boards.deleteOne({ _id: boardId }).then(result => {
    //   res.send(result);
    // });
    boards.updateOne({ _id: boardId }, { $set: { isDeleted: true } }).then(result => { res.send(result) });
  });

  router.post("/userId", (req, res) => {
    const { userSearchField } = req.body;
    users.findOne({ name: userSearchField }).then(user => {
      if (user) res.status(200).json(user._id);
      else {
        res.status(404).send("no User EXISTS with such name");
      }
    });
  });

  const getOrArray = userSearchField => {
    const names = userSearchField.split(' ');
    if (names.length > 1) {
      return [
        { $and: [{ "name.firstName": { $regex: names[0], $options: "i" } }, { "name.lastName": { $regex: names[1], $options: "i" } }] },
        { $and: [{ "name.firstName": { $regex: names[1], $options: "i" } }, { "name.lastName": { $regex: names[0], $options: "i" } }] },
        { "name": { $regex: userSearchField, $options: "i" } }
      ]
    }
    return [
      { "name.firstName": { $regex: userSearchField, $options: "i" } },
      { "name.lastName": { $regex: userSearchField, $options: "i" } },
      { "name": { $regex: userSearchField, $options: "i" } }
    ]
  };

  router.post("/userRegex", (req, res) => {
    const { userSearchField } = req.body;
    users
      .find({ $or: getOrArray(userSearchField) })
      .toArray()
      .then(users => {
        if (users) {
          const serializedUsers = users.map(user => {
            user = transformUser(user);
            return ({
              value: user._id,
              label: user.display
            })
          });
          res.status(200).json(serializedUsers);
        } else {
          res.status(404).send("no Users EXISTS with such name");
        }
      });
  });

  router.post("/users/getByIds", (req, res) => {
    if (!req.user) {
      return res.status(403).send("You don't have permissions");
    }

    users
      .find({ _id: { $in: req.body.ids || [] } })
      .toArray()
      .then(users => {
        const serializedUsers = users.reduce((accumulator, currentUser) => {
          // Pick only public properties from the user's object
          const serializedUser = pick(transformUser(currentUser), PUBLIC_USER_PROPERTIES);
          accumulator[currentUser._id] = serializedUser;

          return accumulator;
        }, {});

        res.status(200).json(serializedUsers);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error");
      });
  });

  return router;
};

export default api;
