/* *********************
 * THIRD-PARTY LIBRARIES
 ***********************/
import mongoose from 'mongoose';

/* *******************
 * MONGOOSE SCHEMA
 ********************/
const contactSchema = new mongoose.Schema({
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
        maxlength: [100, 'Email cannot exceed 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true,
        maxlength: [20, 'Phone cannot exceed 20 characters']
    },
    company_name: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    project_name: {
        type: String,
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [50, 'Department cannot exceed 50 characters']
    },
    project_desc: {
        type: String,
        maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    message: {
        type: String,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    file: {
        type: String,
        default: null
    }
}, { timestamps: true });

/* *******
 * EXPORTS
 *********/
export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);