const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
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
  }
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')){
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(`${this.name} ${uuidv4()}`);
  // finds if other stores already have same name, and increment if so

  next();
  // TODO make more resilient so slugs are always unique
})

module.exports = mongoose.model('Store', storeSchema);