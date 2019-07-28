const mongoose = require('mongoose');
const Store = mongoose.model('Store')

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: '💩 Add Store' });
}

exports.createStore = async (req, res) => {
  // const store = new Store(req.body);
  // Wrapped, added .save() so the response will have slug added to the store variable
  const store = await (new Store(req.body)).save();
  // store.save(); // fires off a connection to MongoDB database comes back with the store or an Error
  // store.save() returns a promise so we can await it.
  // await store.save();
  // use composition; use a higher function that wraps createStore to catch errors
  req.flash('success', `You have succesxsfully created ${store.name}. Do you want to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.updateStore = async (req, res) => {
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

exports.editStore = async(req, res) => {
  // 1. find store given the ID
  const storeId = req.params.id;
  // 2. confirm thy ar the owner of the store
  // 3. render the edit form to allow the user to update
  const store = await Store.findOne({ _id: storeId});
  res.render('editStore', { title: `Edit ${store.name}`, store });
}