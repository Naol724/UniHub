// backend/controllers/houseController.js
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import House from '../models/House.js';
import fs from 'fs/promises';
import path from 'path';

// @desc    Create a new house listing
// @route   POST /api/houses
// @access  Private
export const createHouse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    currency,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    areaUnit,
    address,
    amenities,
    listingType,
    rentDuration,
    contactInfo
  } = req.body;

  // Validate required fields
  if (!title || !description || !price || !propertyType || !bedrooms || !bathrooms || !area) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  if (!address || !address.street || !address.city || !address.state || !address.zipCode || !address.country) {
    throw new ApiError(400, 'Please provide complete address information');
  }

  if (!contactInfo || !contactInfo.phone || !contactInfo.email) {
    throw new ApiError(400, 'Please provide contact information');
  }

  // Create house listing
  const house = await House.create({
    title,
    description,
    price,
    currency,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    areaUnit,
    address,
    amenities: amenities || [],
    listingType,
    rentDuration,
    contactInfo,
    postedBy: req.user._id
  });

  // Add images if any were uploaded
  if (req.files && req.files.length > 0) {
    const imageData = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    }));
    
    await house.addImages(imageData);
  }

  // Populate for response
  await house.populate('postedBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'House listing created successfully',
    data: house
  });
});

// @desc    Get all house listings with filters
// @route   GET /api/houses
// @access  Public
export const getHouses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    city,
    state,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    featured,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Add filters
  if (city) query['address.city'] = new RegExp(city, 'i');
  if (state) query['address.state'] = new RegExp(state, 'i');
  if (propertyType) query.propertyType = propertyType;
  if (listingType) query.listingType = listingType;
  if (featured) query.featured = featured === 'true';
  if (bedrooms) query.bedrooms = parseInt(bedrooms);
  if (bathrooms) query.bathrooms = parseInt(bathrooms);

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.state': { $regex: search, $options: 'i' } },
      { 'address.street': { $regex: search, $options: 'i' } }
    ];
  }

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const houses = await House.find(query)
    .populate('postedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await House.countDocuments(query);

  res.status(200).json({
    success: true,
    data: houses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get single house by ID
// @route   GET /api/houses/:id
// @access  Public
export const getHouseById = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id)
    .populate('postedBy', 'name email phone');

  if (!house || !house.isActive) {
    throw new ApiError(404, 'House listing not found');
  }

  // Increment views
  await house.incrementViews();

  res.status(200).json({
    success: true,
    data: house
  });
});

// @desc    Update house listing
// @route   PUT /api/houses/:id
// @access  Private (owner only)
export const updateHouse = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  // Check if user is the owner
  if (house.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update your own listings');
  }

  // Update fields
  const updatableFields = [
    'title', 'description', 'price', 'currency', 'propertyType',
    'bedrooms', 'bathrooms', 'area', 'areaUnit', 'address',
    'amenities', 'listingType', 'rentDuration', 'contactInfo', 'status'
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      house[field] = req.body[field];
    }
  });

  await house.save();

  // Populate for response
  await house.populate('postedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'House listing updated successfully',
    data: house
  });
});

// @desc    Delete house listing
// @route   DELETE /api/houses/:id
// @access  Private (owner only)
export const deleteHouse = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  // Check if user is the owner
  if (house.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own listings');
  }

  // Delete images from disk
  for (const image of house.images) {
    try {
      await fs.unlink(image.path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await House.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'House listing deleted successfully'
  });
});

// @desc    Upload house images
// @route   POST /api/houses/:id/images
// @access  Private (owner only)
export const uploadHouseImages = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  // Check if user is the owner
  if (house.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only upload images to your own listings');
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images uploaded');
  }

  // Add images
  const imageData = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype
  }));

  await house.addImages(imageData);

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: house.images
  });
});

// @desc    Set main image for house listing
// @route   PATCH /api/houses/:id/images/:imageId/main
// @access  Private (owner only)
export const setMainImage = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  // Check if user is the owner
  if (house.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only modify your own listings');
  }

  await house.setMainImage(req.params.imageId);

  res.status(200).json({
    success: true,
    message: 'Main image set successfully',
    data: house.images
  });
});

// @desc    Delete house image
// @route   DELETE /api/houses/:id/images/:imageId
// @access  Private (owner only)
export const deleteHouseImage = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  // Check if user is the owner
  if (house.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only modify your own listings');
  }

  // Find the image to delete
  const image = house.images.id(req.params.imageId);
  if (!image) {
    throw new ApiError(404, 'Image not found');
  }

  // Delete image from disk
  try {
    await fs.unlink(image.path);
  } catch (error) {
    console.error('Error deleting image:', error);
  }

  await house.removeImage(req.params.imageId);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
    data: house.images
  });
});

// @desc    Get user's house listings
// @route   GET /api/houses/user/listings
// @access  Private
export const getUserHouseListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = { postedBy: req.user._id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const houses = await House.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await House.countDocuments(query);

  res.status(200).json({
    success: true,
    data: houses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get featured houses
// @route   GET /api/houses/featured
// @access  Public
export const getFeaturedHouses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const houses = await House.getFeatured(parseInt(limit));

  res.status(200).json({
    success: true,
    data: houses
  });
});

// @desc    Search houses by location
// @route   GET /api/houses/search/location
// @access  Public
export const searchHousesByLocation = asyncHandler(async (req, res) => {
  const { city, state, page = 1, limit = 20 } = req.query;

  if (!city || !state) {
    throw new ApiError(400, 'City and state are required for location search');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const houses = await House.findByLocation(city, state)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await House.countDocuments({
    'address.city': new RegExp(city, 'i'),
    'address.state': new RegExp(state, 'i'),
    isActive: true
  });

  res.status(200).json({
    success: true,
    data: houses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Search houses
// @route   GET /api/houses/search
// @access  Public
export const searchHouses = asyncHandler(async (req, res) => {
  const { q: searchTerm, page = 1, limit = 20 } = req.query;

  if (!searchTerm) {
    throw new ApiError(400, 'Search term is required');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const houses = await House.search(searchTerm)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await House.countDocuments({
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'address.city': { $regex: searchTerm, $options: 'i' } },
      { 'address.state': { $regex: searchTerm, $options: 'i' } },
      { 'address.street': { $regex: searchTerm, $options: 'i' } }
    ]
  });

  res.status(200).json({
    success: true,
    data: houses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Toggle house featured status (admin only)
// @route   PATCH /api/houses/:id/featured
// @access  Private (admin only)
export const toggleFeatured = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  house.featured = !house.featured;
  await house.save();

  res.status(200).json({
    success: true,
    message: `House ${house.featured ? 'featured' : 'unfeatured'} successfully`,
    data: house
  });
});
