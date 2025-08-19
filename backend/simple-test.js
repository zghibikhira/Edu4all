const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edu4all', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function simpleTest() {
  try {
    console.log('🧪 Simple Connection Test...\n');
    
    // Test database connection
    console.log('1. Testing database connection...');
    const dbState = mongoose.connection.readyState;
    console.log('✅ Database connection state:', dbState);
    
    // Test models
    console.log('\n2. Testing models...');
    const User = require('./models/user');
    const Follow = require('./models/follow');
    const Post = require('./models/post');
    
    console.log('✅ User model loaded');
    console.log('✅ Follow model loaded');
    console.log('✅ Post model loaded');
    
    // Test basic queries
    console.log('\n3. Testing basic queries...');
    
    const userCount = await User.countDocuments();
    console.log('✅ User count:', userCount);
    
    const followCount = await Follow.countDocuments();
    console.log('✅ Follow count:', followCount);
    
    const postCount = await Post.countDocuments();
    console.log('✅ Post count:', postCount);
    
    console.log('\n🎉 All basic tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
simpleTest();
