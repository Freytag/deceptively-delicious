const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

// Strict Schema| will only pick up items that are defined here and nothing extra that gets possibly sent.
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String, // auto generated
  description: {
    type: String,
    trim: true,
  },
  tags: [String]
});

storeSchema.pre('save', function(next) {
  if (!this.isModified('name')){
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  next();
  // TODO make more resilient so slugs are always unique
})

module.exports = mongoose.model('Store', storeSchema);