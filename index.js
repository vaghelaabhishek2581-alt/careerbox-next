const axios = require('axios');
const { faker } = require('@faker-js/faker');

// Configuration - Update with your API details
const API_CONFIG = {
    baseUrl: 'http://localhost:3000',
    endpoint: '/api/auth/register',
    timeout: 10000
};

// Function to generate fake user data in your required format
function generateFakeUser() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    return {
        name: fullName,
        email: faker.internet.email({ firstName, lastName }),
        password: 'Test@123' // Using consistent password for testing
    };
}

// Function to register a single user
async function registerUser(userData) {
    try {
        const response = await axios.post(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`,
            userData,
            {
                timeout: API_CONFIG.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            status: response.status,
            data: response.data,
            userData: userData
        };
    } catch (error) {
        return {
            success: false,
            error: error.response ? {
                status: error.response.status,
                message: error.response.data?.message || error.message,
                data: error.response.data
            } : {
                message: error.message
            },
            userData: userData
        };
    }
}

// Main seeding function
async function seedUsers(numberOfUsers = 100, batchSize = 50, delayBetweenBatches = 1000) {
    console.log(`🚀 Starting to seed ${numberOfUsers} users`);
    console.log(`📍 Target API: ${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`);
    console.log(`⚙️  Batch size: ${batchSize}, Delay: ${delayBetweenBatches}ms`);
    console.log('─'.repeat(60));

    const results = {
        total: numberOfUsers,
        successful: 0,
        failed: 0,
        errors: []
    };

    console.time('Total seeding time');

    for (let i = 0; i < numberOfUsers; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, numberOfUsers - i);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(numberOfUsers / batchSize);

        console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${currentBatchSize} users)`);

        // Create batch of registration promises
        const batchPromises = [];
        for (let j = 0; j < currentBatchSize; j++) {
            const userData = generateFakeUser();
            batchPromises.push(registerUser(userData));
        }

        // Execute batch
        try {
            const batchResults = await Promise.allSettled(batchPromises);

            // Process batch results
            let batchSuccess = 0;
            let batchFailed = 0;

            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    batchSuccess++;
                    results.successful++;
                } else {
                    batchFailed++;
                    results.failed++;

                    const error = result.status === 'rejected'
                        ? result.reason
                        : result.value.error;

                    results.errors.push({
                        userData: result.status === 'fulfilled'
                            ? result.value.userData
                            : batchPromises[index].userData,
                        error: error
                    });
                }
            });

            // Show batch progress
            console.log(`   ✅ Success: ${batchSuccess} | ❌ Failed: ${batchFailed}`);
            console.log(`   📊 Overall: ${results.successful}/${results.total} (${((results.successful / results.total) * 100).toFixed(1)}%)`);

            // Add delay between batches to avoid overwhelming the API
            if (i + batchSize < numberOfUsers && delayBetweenBatches > 0) {
                console.log(`   ⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }

        } catch (error) {
            console.error(`❌ Batch ${batchNumber} failed:`, error.message);
            results.failed += currentBatchSize;
        }
    }

    console.timeEnd('Total seeding time');
    console.log('\n' + '='.repeat(60));
    console.log('📋 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Users: ${results.total}`);
    console.log(`✅ Successful: ${results.successful} (${((results.successful / results.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);

    if (results.errors.length > 0) {
        console.log('\n🔍 ERROR DETAILS:');
        console.log('─'.repeat(30));

        // Group errors by type
        const errorGroups = {};
        results.errors.forEach(item => {
            const errorKey = item.error.status || item.error.message || 'Unknown';
            if (!errorGroups[errorKey]) {
                errorGroups[errorKey] = [];
            }
            errorGroups[errorKey].push(item);
        });

        Object.entries(errorGroups).forEach(([errorType, items]) => {
            console.log(`   ${errorType}: ${items.length} users`);
            if (items.length <= 3) {
                items.forEach(item => {
                    console.log(`     • ${item.userData.email}: ${item.error.message || errorType}`);
                });
            } else {
                items.slice(0, 2).forEach(item => {
                    console.log(`     • ${item.userData.email}: ${item.error.message || errorType}`);
                });
                console.log(`     • ... and ${items.length - 2} more`);
            }
        });
    }

    return results;
}

// Function to test the API connection
async function testAPIConnection() {
    console.log('🔍 Testing API connection...');

    const testUser = {
        name: "Test User",
        email: `test.${Date.now()}@example.com`,
        password: "Test@123"
    };

    const result = await registerUser(testUser);

    if (result.success) {
        console.log('✅ API connection successful!');
        console.log(`   Status: ${result.status}`);
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
        return true;
    } else {
        console.log('❌ API connection failed!');
        console.log(`   Error:`, result.error);
        return false;
    }
}

// Main execution function
async function main() {
    console.log('🌱 USER DATA SEEDER');
    console.log('='.repeat(60));

    // Test API connection first
    const connectionOk = await testAPIConnection();

    if (!connectionOk) {
        console.log('\n❌ Cannot proceed with seeding due to API connection issues.');
        console.log('Please check:');
        console.log('   • API server is running');
        console.log('   • Correct URL and endpoint');
        console.log('   • Network connectivity');
        return;
    }

    console.log('\n⏳ Starting seeding process in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start seeding
    try {
        const results = await seedUsers(
            1000,  // Number of users to create
            20,    // Batch size (users per batch)
            500    // Delay between batches in milliseconds
        );

        console.log('\n🎉 Seeding process completed!');

    } catch (error) {
        console.error('\n💥 Seeding process failed:', error.message);
    }
}

// Export functions for use as module
module.exports = {
    seedUsers,
    generateFakeUser,
    registerUser,
    testAPIConnection,
    API_CONFIG
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}