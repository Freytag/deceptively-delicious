const mongoose = require('mongoose');
// mongoose.Promise = global.Promise; should be fixed by now
const slug = require('slugs');
const uuidv4 = require('uuid/v4');

// Strict Schema| will only pick up items that are defined here and nothing extra that gets possibly sent.
// understand custom data types.
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
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'location must be provided'
    }],
    address: {
      type: String,
      required: 'An Address is Required for a Location'
    }
  },
  photo: {
    type: String
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Every store must have an author'
  }
});

storeSchema.index({
  name: 'text',
  description: 'text'
})

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')){
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(`${this.name} ${uuidv4()}`);
  next();
})

// TODO add pre-save function to remove HTML from specific inputs before saving to DB.

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
      // $ says this is a field on my document i want to unwind
    { $group: { _id: '$tags', count: { $sum: 1 } } },
      //group everything based on their tag field. //new property count using sum operator.
    { $sort: { count: -1 } }
     // -1 descending, 1 ascending
  ]);
}

module.exports = mongoose.model('Store', storeSchema);