const HotSpotIcon = require("../models/hotSpotIcon");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dd97mjjt2",
  api_key: "274253912236812",
  api_secret: "Uwjh26mCiIyphfEC46B2Fm-LFDA"
});

const getHotSpotIcon = (req, res, next) => {
  HotSpotIcon.find()
    .then(places => {
      res.json({ places });
    })
    .catch(error => {
      res.json({ error });
    });
};

const getHotSpotIconByPlaceId = (req, res, next) => {
  const placeId = req.params.pid;
  HotSpotIcon.find({ placeId })
    .then(icons => {
      if (icons) {
        res.json({ icons, message: "Three sixty hot spots found" });
      } else {
        res.json({ message: "No three sixty hot spots found for this place id" });
      }
    })
    .catch(error => {
      res.json({ error });
    });
};

const addHotSpotIcon = (req, res, next) => {
  console.log('req.body =>', req.body);
  console.log('req.params.pid =>', req.params.pid);

  const pid = req.params.pid;
  const { name, imageUrl, placeId, userId } = req.body;

  const newHotSpotIcon = new HotSpotIcon({
    name: name,
    imageUrl: imageUrl,
    placeId: placeId,
    userId: userId,
  });
  newHotSpotIcon
    .save()
    .then(hotSpot => {
      res.json({ hotSpot, message: "Three sixty place added successfully" });
    })
    .catch(error => {
      res.json({ error });
    });
};
const addHotSpotByCloudinary = (req, res, next) => {
  //console.log(req.files.image);
  console.log(req.body.name);

  const pid = req.params.pid;
  const name = req.body.name;
  console.log(pid);

  let url = null;
  if (req.files) {
    const file = req.files.image;

    cloudinary.uploader.upload(file.tempFilePath, (error, result) => {
      if (error) {
        console.log("Error", error);
      } else {
        console.log("Result", result);
        url = result.url;
        const three = new HotSpotIcon({
          image: url,
          placeId: pid,
          title: title
        });
        three
          .save()
          .then(place => {
            res.json({ place, message: "Three sixty place added succesfully" });
          })
          .catch(error => {
            res.json({ error });
          });
      }
    });
  }
};

const deleteHotSpotIcon = (req, res, next) => {
  console.log(req.params.pid);
  const placeId = req.params.pid;
  const id = req.body.id;
  HotSpotIcon.findByIdAndDelete(id)
    .then(hotSpot => {
      if (hotSpot) {
        res.json({ hotSpot, message: "Deleted successfully" });
      } else {
        res.json({ message: "No three sixty place found by this id" });
      }
    })
    .catch(error => {
      res.json({ error });
    });
};

const updateHotSpotIcon = (req, res, next) => {
  console.log(req.params.pid);
  const pid = req.params.pid;
  const { id, imageUrl, name, userId, placeId } = req.body

  HotSpotIcon.findByIdAndUpdate(id, {
    name,
    imageUrl,
    placeId,
    userId
  })
    .then(hotSpot => {
      res.json({
        hotSpot,
        message: "Three sixty place updated successfully"
      });
    })
    .catch(error => {
      res.json({ error });
    });
  
};
const updateHotSpotByCloudinary = (req, res, next) => {
  console.log(req.params.tid);
  const tid = req.params.tid;
  const id = req.body.id;
  const title = req.body.title;
  if (req.files) {
    const file = req.files.image;

    cloudinary.uploader.upload(file.tempFilePath, (error, result) => {
      if (error) {
        console.log("Error", error);
      } else {
        console.log("Result", result);
        url = result.url;
        HotSpotIcon.findByIdAndUpdate(tid, {
          title,
          image: url
        })
          .then(place => {
            res.json({
              place,
              message: "Three sixty place updated succesfully"
            });
          })
          .catch(error => {
            res.json({ error });
          });
      }
    });
  } else {
    HotSpotIcon.findByIdAndUpdate(tid, {
      title
    })
      .then(place => {
        res.json({ place, message: "Three sixty place updated successfully" });
      })
      .catch(error => {
        res.json({ error });
      });
  }
};

exports.getHotSpotIcon = getHotSpotIcon;
exports.addHotSpotIcon = addHotSpotIcon;
exports.deleteHotSpotIcon = deleteHotSpotIcon;
exports.getHotSpotIconByPlaceId = getHotSpotIconByPlaceId;
exports.updateHotSpotIcon = updateHotSpotIcon;
