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
},
// virtuals do not get but on the top level object by default
{
  toJSON: { virtuals: true},
  toObject: { virtuals: true}
});

// an index on the storeSchema tells MongoDB
// that we want to access a lot of information so pre cache it.
storeSchema.index({
  name: 'text',
  description: 'text'
})

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')){
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(`${this.name} ${uuidv4()}`);
  next();
})

// TODO add pre-save function to remove HTML from specific inputs before saving to DB.
// .aggregate is a complex query function similar to .find
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    // $ says this is a field on my document i want to unwind
    { $unwind: '$tags' },
    //group everything based on their tag field. //new property count using sum operator.
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    // -1 descending, 1 ascending
    { $sort: { count: -1 } }
  ]);
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // 1. Lookup stores and populate their reviews
    { $lookup: {
        // mongoDB will take the model name and lowercase it and add an 's' at the end
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews'
      }
    },
    // 2. Filter for stores with more than 1 review
    { $match: {'reviews.1': {$exists: true }}},
    // 3. Add an averageReviews field (Project is to add a field)
    // newer $addFields method just added the one field on the existing document
    { $addFields: {
      averageRating: {$avg: '$reviews.rating'}
    }},
    // or
    // older method project only returns the one field, so we have to add the ones we want to include
    // { $project: {
    //   photo: '$$ROOT.photo',
    //   name: '$$ROOT.name',
    //   reviews: '$$ROOT.reviews',
    //   averageRating: {$avg: '$reviews.rating'}
    // }},
    // 4. Sort by our new field
    { $sort: { averageRating: -1 }},
    // 5. Limit to max 10 stores
    { $limit: 10 }
  ])
}

// can't use virtuals in aggregate, aggregate doesn't know about them
// find reviews where the stored id property === reviews store
storeSchema.virtual('review', {
  ref: 'Review', // what model to link
  localField: '_id', // which field on the store
  foreignField: 'store' // which field in the review model
})

function autoPopulate(next) {
  this.populate('review');
  next();
}

storeSchema.pre('find', autoPopulate);
storeSchema.pre('findOne', autoPopulate);

module.exports = mongoose.model('Store', storeSchema);