const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Notification = require('./models/notification');
const UserPreferences = require('./models/userPreferences');
const DeliveryLog = require('./models/deliveryLog');

// Test function
async function testNotificationSystem() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edu4all');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a test notification
    console.log('\n📝 Testing notification creation...');
    const testNotification = new Notification({
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      type: 'SESSION_BOOKED',
      title: 'Test Notification',
      body: 'This is a test notification to verify the system is working.',
      link: '/test',
      channels: {
        inApp: true,
        email: false,
        sms: false
      },
      priority: 'normal'
    });

    await testNotification.save();
    console.log('✅ Test notification created:', testNotification._id);

    // Test 2: Test user preferences
    console.log('\n⚙️ Testing user preferences...');
    const testPreferences = new UserPreferences({
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      notifications: {
        emailOn: {
          SESSION_BOOKED: true,
          SESSION_CANCELLED: true
        },
        smsOn: {
          SESSION_BOOKED: false,
          SESSION_CANCELLED: true
        },
        inAppOn: {
          SESSION_BOOKED: true,
          SESSION_CANCELLED: true
        }
      }
    });

    await testPreferences.save();
    console.log('✅ Test preferences created:', testPreferences._id);

    // Test 3: Test delivery log
    console.log('\n📊 Testing delivery log...');
    const testDeliveryLog = new DeliveryLog({
      notificationId: testNotification._id,
      channel: 'inApp',
      status: 'delivered',
      providerId: 'test-provider',
      deliveredAt: new Date()
    });

    await testDeliveryLog.save();
    console.log('✅ Test delivery log created:', testDeliveryLog._id);

    // Test 4: Test notification queries
    console.log('\n🔍 Testing notification queries...');
    const unreadCount = await Notification.getUnreadCount(testNotification.userId);
    console.log('✅ Unread count:', unreadCount);

    const userNotifications = await Notification.getUserNotifications(testNotification.userId, {
      page: 1,
      limit: 10
    });
    console.log('✅ User notifications retrieved:', userNotifications.notifications.length);

    // Test 5: Test preferences methods
    console.log('\n🔧 Testing preference methods...');
    const channelPrefs = testPreferences.getAllChannelPreferences('SESSION_BOOKED');
    console.log('✅ Channel preferences for SESSION_BOOKED:', channelPrefs);

    // Test 6: Test delivery log methods
    console.log('\n📈 Testing delivery log methods...');
    const deliveryStats = await DeliveryLog.getDeliveryStats('inApp', '24h');
    console.log('✅ Delivery stats:', deliveryStats);

    console.log('\n🎉 All tests passed! Notification system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testNotificationSystem();
