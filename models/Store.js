const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now()
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordintes!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    }
});

storeSchema.index({
    name: 'text',
    description: 'text'
});

storeSchema.index({
    location: '2dsphere'
});

storeSchema.pre('save', async function(next) {
    if(!this.isModified('name')) {
        return next();
    }
    this.slug = slug(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ 
        slug: slugRegEx
    });
    if(storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`
    }
    next();
});

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        // Populate reviews on Store
        { 
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'store',
                as: 'reviews'
            }
        },
        // Only take ones with more that 1 review
        {
            $match: {
                'reviews.1': { $exists: true }
            }
        },
        // Include the average of the ratings
        {
            $project: {
                photo: '$$ROOT.photo',
                name: '$$ROOT.name',
                reviews: '$$ROOT.reviews',
                slug: '$$ROOT.slug',
                averageRating: { $avg: '$reviews.rating' }
            }
        },
        // Sort desc by new fields
        {
            $sort: { averageRating: -1 }
        },
        // limit to top 10
        {
            $limit: 10
        }
    ])
};

storeSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'store'
});

function autopopulate(next) {
    this.populate('reviews');
    next();
};

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);