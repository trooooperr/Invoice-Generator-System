const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true },
  price:     { type: Number, required: true },
  available: { type: Boolean, default: true },
  imageUrl:  { type: String, default: '' },
  isAlcohol: { type: Boolean, default: false },
}, { timestamps: true });

menuItemSchema.pre('save', function(next) {
  const alcoholCats = ['Beer','Wine','Spirits','Cocktails','Shots'];
  this.isAlcohol = alcoholCats.includes(this.category);
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
