// backend/models/House.js
import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'ETB', 'CAD', 'AUD'],
    default: 'USD'
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'studio', 'condo', 'townhouse', 'cottage', 'mansion'],
    required: true
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  areaUnit: {
    type: String,
    enum: ['sqft', 'sqm', 'sqyrd'],
    default: 'sqft'
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  amenities: [{
    type: String,
    enum: [
      'parking', 'garage', 'pool', 'garden', 'balcony', 'terrace', 'patio',
      'air_conditioning', 'heating', 'fireplace', 'storage', 'gym',
      'security_system', 'elevator', 'wheelchair_accessible', 'pet_friendly'
    ]
  }],
  images: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['available', 'rented', 'sold', 'under_contract', 'pending'],
    default: 'available'
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent', 'short_term_rental'],
    required: true
  },
  rentDuration: {
    type: String,
    enum: ['monthly', 'weekly', 'daily', 'yearly'],
    default: 'monthly'
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both'
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
houseSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.price);
});

// Virtual for full address
houseSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for days since posted
houseSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const posted = new Date(this.createdAt);
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for better performance
houseSchema.index({ title: 1 });
houseSchema.index({ price: 1 });
houseSchema.index({ 'address.city': 1 });
houseSchema.index({ 'address.state': 1 });
houseSchema.index({ propertyType: 1 });
houseSchema.index({ bedrooms: 1 });
houseSchema.index({ bathrooms: 1 });
houseSchema.index({ listingType: 1 });
houseSchema.index({ status: 1 });
houseSchema.index({ postedBy: 1 });
houseSchema.index({ featured: 1 });
houseSchema.index({ isActive: 1 });
houseSchema.index({ createdAt: -1 });

// Compound indexes
houseSchema.index({ 'address.city': 1, price: 1 });
houseSchema.index({ propertyType: 1, bedrooms: 1 });
houseSchema.index({ listingType: 1, status: 1 });

// Pre-save middleware to set expiration date
houseSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 90 days from posting
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to increment views
houseSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add images
houseSchema.methods.addImages = function(imageData) {
  this.images.push(...imageData);
  // If no main image is set, set the first one as main
  if (!this.images.some(img => img.isMain) && this.images.length > 0) {
    this.images[0].isMain = true;
  }
  return this.save();
};

// Method to set main image
houseSchema.methods.setMainImage = function(imageId) {
  this.images.forEach(img => img.isMain = false);
  const image = this.images.id(imageId);
  if (image) {
    image.isMain = true;
  }
  return this.save();
};

// Method to remove image
houseSchema.methods.removeImage = function(imageId) {
  this.images.pull(imageId);
  // If the removed image was main, set a new main image
  const mainImage = this.images.find(img => img.isMain);
  if (!mainImage && this.images.length > 0) {
    this.images[0].isMain = true;
  }
  return this.save();
};

// Static method to find houses by location
houseSchema.statics.findByLocation = function(city, state, filters = {}) {
  const query = {
    'address.city': new RegExp(city, 'i'),
    'address.state': new RegExp(state, 'i'),
    isActive: true,
    ...filters
  };
  return this.find(query)
    .populate('postedBy', 'name email')
    .sort({ featured: -1, createdAt: -1 });
};

// Static method to search houses
houseSchema.statics.search = function(searchTerm, filters = {}) {
  const query = {
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'address.city': { $regex: searchTerm, $options: 'i' } },
      { 'address.state': { $regex: searchTerm, $options: 'i' } },
      { 'address.street': { $regex: searchTerm, $options: 'i' } }
    ],
    ...filters
  };
  
  return this.find(query)
    .populate('postedBy', 'name email')
    .sort({ featured: -1, createdAt: -1 });
};

// Static method to get featured houses
houseSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ featured: true, isActive: true })
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get houses by price range
houseSchema.statics.findByPriceRange = function(minPrice, maxPrice, filters = {}) {
  const query = {
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true,
    ...filters
  };
  
  return this.find(query)
    .populate('postedBy', 'name email')
    .sort({ price: 1, createdAt: -1 });
};

export default mongoose.model('House', houseSchema);
