/* *********************
 * THIRD-PARTY LIBRARIES
 *********************/
import mongoose from 'mongoose';

/* *********************
 * VALID BUILDING TYPES
 *********************/
const buildingTypes = ['residential', 'commercial', 'industrial'];

/* *******************
 * QUOTE SCHEMA
 ********************/
const quoteSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    buildingType: {
        type: String,
        required: [true, 'Building type is required'],
        enum: {
            values: buildingTypes,
            message: '{VALUE} is not a valid building type'
        },
        lowercase: true,
        trim: true
    },
    apartments: {
        type: Number,
        min: [0, 'Apartments cannot be negative'],
        default: null
    },
    floors: {
        type: Number,
        min: [0, 'Floors cannot be negative'],
        default: null
    },
    occupancy: {
        type: Number,
        min: [0, 'Occupancy cannot be negative'],
        default: null
    },
    elevators: {
        type: Number,
        min: [0, 'Elevators cannot be negative'],
        default: null
    },
    calculatedElevators: {
        type: Number,
        required: [true, 'Calculated elevators is required'],
        min: [0, 'Calculated elevators cannot be negative']
    },
    estimatedCost: {
        type: Number,
        required: [true, 'Estimated cost is required'],
        min: [0, 'Estimated cost cannot be negative']
    }
}, { timestamps: true });

/* *******
 * EXPORTS
 *********/
export default mongoose.models.Quote || mongoose.model('Quote', quoteSchema);
