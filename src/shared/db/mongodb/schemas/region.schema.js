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
const regionSchema = new mongoose.Schema({
    region: {
        type: String,
        enum: {
            values: regions,
            message: '{VALUE} is not a valid region. Must be one of: {VALUES}'
        },
        required: [true, 'Region name is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true // Primary query field
    },
    address: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    total_sales: {
        type: Number,
        min: [0, 'Total sales cannot be negative'],
        default: 0,
        validate: {
            validator: function(value) {
                return Number.isFinite(value);
            },
            message: 'Total sales must be a valid number'
        }
    },
    manager: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
    }],
    top_agents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
    }],
}, { timestamps: true });

/* *******
 * EXPORTS
 *********/
export default mongoose.models.Region || mongoose.model('Region', regionSchema);