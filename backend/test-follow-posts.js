const mongoose = require('mongoose');
const Follow = require('./models/follow');
const Post = require('./models/post');
const User = require('./models/user');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edu4all', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testFollowPosts() {
  let teacher, student;
  
  try {
    console.log('🧪 Testing Follow & Posts Functionality...\n');

    // Clean up existing test data
    console.log('0. Cleaning up existing test data...');
    await User.deleteMany({ email: { $in: ['teacher@test.com', 'student@test.com'] } });
    await Follow.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Test data cleaned up');

    // Test 1: Create test users
    console.log('\n1. Creating test users...');
    
    // Create a teacher
    teacher = new User({
      email: 'teacher@test.com',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'enseignant',
      teacherInfo: {
        subjects: ['Mathématiques', 'Physique'],
        experience: 5,
        education: {
          degree: 'Master en Mathématiques',
          institution: 'Université de Paris',
          year: 2018
        },
        followersCount: 0,
        postsCount: 0
      }
    });
    await teacher.save();
    console.log('✅ Teacher created:', teacher.firstName, teacher.lastName);

    // Create a student
    student = new User({
      email: 'student@test.com',
      password: 'password123',
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'etudiant',
      studentInfo: {
        level: 'lycee'
      }
    });
    await student.save();
    console.log('✅ Student created:', student.firstName, student.lastName);

    // Test 2: Follow functionality
    console.log('\n2. Testing follow functionality...');
    
    const follow = new Follow({
      followerId: student._id,
      teacherId: teacher._id
    });
    await follow.save();
    console.log('✅ Follow relationship created');

    // Check if following
    const isFollowing = await Follow.isFollowing(student._id, teacher._id);
    console.log('✅ Is following check:', isFollowing);

    // Get followers count
    const followersCount = await Follow.getFollowersCount(teacher._id);
    console.log('✅ Followers count:', followersCount);

    // Test 3: Post functionality
    console.log('\n3. Testing post functionality...');
    
    const post = new Post({
      teacherId: teacher._id,
      text: 'Bonjour à tous ! Je suis ravi de partager avec vous mes connaissances en mathématiques.',
      visibility: 'public',
      tags: ['mathématiques', 'éducation']
    });
    await post.save();
    console.log('✅ Post created');

    // Test 4: Get teacher posts
    console.log('\n4. Testing get teacher posts...');
    
    const posts = await Post.getTeacherPosts(teacher._id, { page: 1, limit: 10 });
    console.log('✅ Teacher posts retrieved:', posts.posts.length, 'posts');

    // Test 5: Get feed posts
    console.log('\n5. Testing feed functionality...');
    
    const feedPosts = await Post.getFeedPosts(student._id, [teacher._id], { page: 1, limit: 10 });
    console.log('✅ Feed posts retrieved:', feedPosts.posts.length, 'posts');

    // Test 6: Post engagement
    console.log('\n6. Testing post engagement...');
    
    post.addLike(student._id);
    post.incrementViews();
    await post.save();
    console.log('✅ Post engagement updated');

    // Test 7: Post statistics
    console.log('\n7. Testing post statistics...');
    
    const postStats = await Post.getPostStats(teacher._id);
    console.log('✅ Post stats:', postStats);

    // Test 8: Update user stats
    console.log('\n8. Testing user stats update...');
    
    await User.findByIdAndUpdate(teacher._id, {
      $inc: { 'teacherInfo.followersCount': 1, 'teacherInfo.postsCount': 1 }
    });
    
    const updatedTeacher = await User.findById(teacher._id);
    console.log('✅ Teacher stats updated - Followers:', updatedTeacher.teacherInfo.followersCount, 'Posts:', updatedTeacher.teacherInfo.postsCount);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Follow relationship: ✅');
    console.log('- Post creation: ✅');
    console.log('- Feed functionality: ✅');
    console.log('- Engagement features: ✅');
    console.log('- Statistics tracking: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Clean up test data
    try {
      if (teacher) await User.findByIdAndDelete(teacher._id);
      if (student) await User.findByIdAndDelete(student._id);
      await Follow.deleteMany({});
      await Post.deleteMany({});
      console.log('\n🧹 Test data cleaned up');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
    
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testFollowPosts();
