// Script to create missing Institute document for user with institute role
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// MongoDB connection string - update if needed
const MONGODB_URI = 'mongodb://localhost:27017/careerbox';

// User details from the provided document
const USER_ID = '68d565e7d84ab62527ce4736';
const USER_EMAIL = 'mitalivaghela75@gmail.com';

// Define schemas
const InstituteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrationIntentId: { type: mongoose.Schema.Types.ObjectId, ref: 'RegistrationIntent' },
    name: { type: String, required: true },
    publicProfileId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
        street: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String }
    },
    website: { type: String },
    establishmentYear: { type: Number },
    description: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    accreditation: [{ type: String }],
    socialMedia: {
        facebook: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        instagram: { type: String }
    },
    studentCount: { type: Number, default: 0 },
    facultyCount: { type: Number, default: 0 },
    courseCount: { type: Number, default: 0 },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personalDetails: {
        firstName: String,
        lastName: String
    }
});

// Function to generate unique publicProfileId
async function generateUniquePublicProfileId(baseName, type, Institute, Business, Profile) {
    const cleanName = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);

    let publicProfileId = cleanName || type;
    let counter = 0;
    let isUnique = false;

    while (!isUnique && counter < 10) {
        // Check if ID exists in any collection
        const [profileExists, instituteExists, businessExists] = await Promise.all([
            Profile.findOne({ publicProfileId }),
            Institute.findOne({ publicProfileId }),
            Business ? Business.findOne({ publicProfileId }) : Promise.resolve(null)
        ]);

        if (!profileExists && !instituteExists && !businessExists) {
            isUnique = true;
        } else {
            counter++;
            if (counter === 1) {
                publicProfileId = `${cleanName}-${type}`;
            } else if (counter === 2) {
                publicProfileId = `${type}-${cleanName}`;
            } else {
                publicProfileId = `${cleanName}-${type}-${counter}`;
            }
        }
    }

    return publicProfileId;
}

async function fixInstituteAccess() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create models
        const Institute = mongoose.model('Institute', InstituteSchema);
        const Profile = mongoose.model('Profile', ProfileSchema);
        const Business = null; // We don't need Business for this fix

        // Check if Institute already exists for this user
        const existingInstitute = await Institute.findOne({ userId: new ObjectId(USER_ID) });

        if (existingInstitute) {
            console.log('Institute already exists for this user:', existingInstitute.name);
            console.log('Institute ID:', existingInstitute._id);
            console.log('Public Profile ID:', existingInstitute.publicProfileId);
            process.exit(0);
        }

        // Get user profile for name
        const profile = await Profile.findOne({ userId: new ObjectId(USER_ID) });
        const userName = profile?.personalDetails?.firstName || 'User';
        const instituteName = `${userName}'s Institute`;

        // Generate unique publicProfileId
        const publicProfileId = await generateUniquePublicProfileId(
            instituteName,
            'institute',
            Institute,
            Business,
            Profile
        );

        console.log('Generated publicProfileId:', publicProfileId);

        // Create new Institute
        const newInstitute = new Institute({
            userId: new ObjectId(USER_ID),
            name: instituteName,
            publicProfileId: publicProfileId,
            email: USER_EMAIL,
            contactPerson: userName,
            phone: '0000000000', // Default phone
            address: {
                street: 'Not specified',
                city: 'Not specified',
                state: 'Not specified',
                country: 'India',
                zipCode: '000000'
            },
            description: 'Institute profile created for existing user with institute role',
            establishmentYear: new Date().getFullYear(),
            status: 'active',
            isVerified: false,
            studentCount: 0,
            facultyCount: 0,
            courseCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newInstitute.save();
        console.log('✅ Successfully created Institute for user');
        console.log('Institute Details:');
        console.log('- ID:', newInstitute._id);
        console.log('- Name:', newInstitute.name);
        console.log('- Public Profile ID:', newInstitute.publicProfileId);
        console.log('- Status:', newInstitute.status);
        console.log('\nYou should now be able to access the institute dashboard at /dashboard/institute');
        console.log('Public profile will be available at /' + newInstitute.publicProfileId);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the fix
fixInstituteAccess();
