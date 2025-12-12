import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    formType: {
        type: String,
        required: [true, 'Form type is required'],
        enum: ['get-a-quote', 'join-our-team', 'contact', 'unknown'],
        index: true
    },
    // Common Fields
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },

    // Quote Specific Fields
    company: String,
    budget: String,
    servicesInterested: {
        type: String, // Stored as comma separated string or could be Array
        trim: true
    },

    // Metadata
    pageUrl: String,
    ip: {
        type: String,
        select: false // Don't return IP by default for privacy
    },
    status: {
        type: String,
        enum: ['new', 'read', 'contacted', 'archived'],
        default: 'new'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create index for faster queries by type and date
submissionSchema.index({ formType: 1, createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
