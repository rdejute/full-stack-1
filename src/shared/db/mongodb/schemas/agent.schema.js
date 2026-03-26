/* *********************
 * THIRD-PARTY LIBRARIES
 ***********************/
import mongoose from 'mongoose';

/* ***************************
 * CONSTANTS AND CONFIGURATION
 *****************************/
const regions = ['north', 'south', 'east', 'west'];

/* *******************
 * MONGOOSE SCHEMA
 ********************/
const agentSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    region: {
        type: String,
        enum: {
            values: regions,
            message: '{VALUE} is not a valid region. Must be one of: {VALUES}'
        },
        required: [true, 'Region is required'],
        lowercase: true,
        trim: true
    },
    sales: {
        type: Number,
        min: [0, 'Sales cannot be negative'],
        default: 0
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [100, 'Rating cannot exceed 100'],
        default: 0
    },
    fee: {
        type: Number,
        min: [0, 'Fee cannot be negative'],
        default: 0
    },
    manager: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

/* *******
 * EXPORTS
 *********/
export default mongoose.models.Agent || mongoose.model('Agent', agentSchema);