const User = require('./src/models/User');
const Contact = require('./src/models/Contact');
const Campaign = require('./src/models/Campaign');

async function testMySQL() {
  try {
    console.log('Testing MySQL implementation...');
    
    // Test User model
    console.log('Testing User model...');
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'agent'
    };
    
    const user = await User.create(userData);
    console.log('User created:', user);
    
    const foundUser = await User.findById(user.id);
    console.log('User found by ID:', foundUser);
    
    const foundUserByEmail = await User.findByEmail('test@example.com');
    console.log('User found by email:', foundUserByEmail);
    
    // Test Contact model
    console.log('\nTesting Contact model...');
    const contactData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumbers: JSON.stringify([{type: 'mobile', number: '1234567890', primary: true}]),
      createdBy: user.id
    };
    
    const contact = await Contact.create(contactData);
    console.log('Contact created:', contact);
    
    const foundContact = await Contact.findById(contact.id);
    console.log('Contact found by ID:', foundContact);
    
    // Test Campaign model
    console.log('\nTesting Campaign model...');
    const campaignData = {
      name: 'Test Campaign',
      description: 'A test campaign',
      createdBy: user.id,
      dialingStrategy: 'manual'
    };
    
    const campaign = await Campaign.create(campaignData);
    console.log('Campaign created:', campaign);
    
    const foundCampaign = await Campaign.findById(campaign.id);
    console.log('Campaign found by ID:', foundCampaign);
    
    console.log('\nMySQL implementation test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('MySQL implementation test failed:', error);
    process.exit(1);
  }
}

testMySQL();