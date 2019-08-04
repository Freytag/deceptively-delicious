const mongoose = require('mongoose');
const Store = mongoose.model('Store')
const User = mongoose.model('User')
const multer = require('multer');
const jimp = require('jimp');
const uuidv4 = require('uuid/v4');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      // next(0,1) if 0 is truthy item it is handled as an error
      // if 0 is null, second value is what get passed along.
      next(null, true);
    } else {
      next({message: 'The file uploaded is not an approved file type.'}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: '💩 Add Store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is a new file or not
  if(!req.file) {
    next();
    return;
  }
  const ext = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuidv4()}.${ext}`
  // now resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going
  next();
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  // const store = new Store(req.body);
  // Wrapped, added .save() so the response will have slug added to the store variable
  const store = await (new Store(req.body)).save();
  // store.save(); // fires off a connection to MongoDB database comes back with the store or an Error
  // store.save() returns a promise so we can await it.
  // await store.save();
  // use composition; use a higher function that wraps createStore to catch errors
  req.flash('success', `You have successfully created ${store.name}. Do you want to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point';
  // 1. find and update the store
  // findOneAndUpdate(query object, data, options{});
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one.
    runValidators: true, //
  }).exec(); //returns a promise
  // 2. redirect them to the store to tell them it worked.
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View ${store.name}</a>`)
  res.redirect(`/stores/${store._id}/edit`)

}

exports.getStores = async(req, res) => {
  // 1. Query the database for a list of all stores.
  const stores = await Store.find(); //finds all stores. returns promise
  res.render('stores', { title: 'Stores', stores: stores });
}

exports.getStoreBySlug = async (req, res) => {
  // 1. find store given the ID
  const storeSlug = req.params.slug;
  // 2. render the edit form to allow the user to update
  // const store = await Store.findOne({ slug: storeSlug});
  const store = await Store.findOne({ slug: storeSlug}).populate('author review');
  res.render('store', { title: `${store.name}`, store });
}

exports.confirmOwner = (store, user) => {
  // we are not using middle ware as we need to find the store before we can check
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it.');
  }
}

exports.editStore = async(req, res) => {
  // 1. find store given the ID
  const storeId = req.params.id;
  const store = await Store.findOne({ _id: storeId});
  // 2. confirm thy ar the owner of the store
  this.confirmOwner(store, req.user);
  // 3. render the edit form to allow the user to update
  res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.getStoreByTag = async (req, res) => {
  const selectedTag = req.params.tag;
  const tagQuery = selectedTag || { $exists: true }
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery })
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, title: 'Tags', selectedTag, stores })
}

exports.searchStores = async (req, res) => {
  const stores = await Store
  // Find all matching stores.
  .find({
    $text: {
      $search: req.query.q
    }
  },{
    score: { $meta: 'textScore' }
  })
  // Change sort to Descending
  .sort({
    score: { $meta: 'textScore' }
  })
  // set the max number of results
  .limit(5);
  res.json(stores);
}

exports.mapStores = async (req, res) => {
  const coords =  [ req.query.lng, req.query.lat ].map(parseFloat);
  const query = {
    location: {
      $nearSphere: {
        $geometry: {
          type : "Point",
          coordinates : coords
        },
       $maxDistance: 10000
      }
    }
  }
  // .select allows us to define only the properties we want
  // selective   photo  name
  // exclusive  -photo -name
  const stores = await Store.find(query).select('slug name description location photo').limit(10);
  res.json(stores);
}

exports.showMap = (req, res) => {
  res.render('map', {title: 'Stores Near By'});
}

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id }},
    { new: true }
  );
  res.json(user);
}

exports.getHearts = async(req, res) => {
  // const stores = await Store.find({ _id: req.user.hearts});
  const stores = await Store.find({ _id: { $in: req.user.hearts }});
  res.render('stores', { title: 'Your ❤️ Stores', stores });
}

exports.getTopStores = async(req, res) => {
  // best practice is to Keep Big queries with the model, so we created a method
  const stores = await Store.getTopStores();
  res.render('top', {title: 'Top Stores', stores})
}