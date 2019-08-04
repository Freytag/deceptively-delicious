const mongoose = require('mongoose');
// mongoose.Promise = global.Promise; should be fixed by now

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'you must supply an author!'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'you must supply a Store!'
  },
  text: {
    type: String,
    required: 'You must have text in your review'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

function autoPopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autoPopulate);
reviewSchema.pre('findOne', autoPopulate);

module.exports = mongoose.model('Review', reviewSchema)