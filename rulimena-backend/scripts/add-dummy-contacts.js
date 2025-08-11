const Contact = require('../src/models/Contact');
const User = require('../src/models/User');

async function addDummyContacts() {
  try {
    console.log('Adding dummy contacts for testing...');
    
    // Check if we have an admin user to use as createdBy
    let adminUser = await User.findByEmail('anderson@rdesk.io');
    if (!adminUser) {
      console.log('Admin user not found, creating contacts without createdBy field');
    }
    
    const createdBy = adminUser ? adminUser.id : null;
    
    // Dummy contact data
    const dummyContacts = [
      {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Solutions Inc.',
        email: 'john.doe@example.com',
        phoneNumbers: JSON.stringify([
          { type: 'mobile', number: '+1234567890', primary: true },
          { type: 'work', number: '+1234567891', primary: false }
        ]),
        address: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        }),
        demographics: JSON.stringify({
          age: 35,
          gender: 'male',
          income: '75000',
          occupation: 'Software Engineer'
        }),
        score: 85,
        status: 'new',
        createdBy: createdBy
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Marketing Pro LLC',
        email: 'jane.smith@example.com',
        phoneNumbers: JSON.stringify([
          { type: 'mobile', number: '+1234567892', primary: true }
        ]),
        address: JSON.stringify({
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'USA'
        }),
        demographics: JSON.stringify({
          age: 28,
          gender: 'female',
          income: '65000',
          occupation: 'Marketing Manager'
        }),
        score: 78,
        status: 'new',
        createdBy: createdBy
      },
      {
        firstName: 'Robert',
        lastName: 'Johnson',
        company: 'Finance Group',
        email: 'robert.johnson@example.com',
        phoneNumbers: JSON.stringify([
          { type: 'mobile', number: '+1234567893', primary: true },
          { type: 'home', number: '+1234567894', primary: false }
        ]),
        address: JSON.stringify({
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          country: 'USA'
        }),
        demographics: JSON.stringify({
          age: 42,
          gender: 'male',
          income: '95000',
          occupation: 'Financial Analyst'
        }),
        score: 92,
        status: 'new',
        createdBy: createdBy
      },
      {
        firstName: 'Emily',
        lastName: 'Williams',
        company: 'Healthcare Plus',
        email: 'emily.williams@example.com',
        phoneNumbers: JSON.stringify([
          { type: 'mobile', number: '+1234567895', primary: true }
        ]),
        address: JSON.stringify({
          street: '321 Elm Dr',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          country: 'USA'
        }),
        demographics: JSON.stringify({
          age: 31,
          gender: 'female',
          income: '70000',
          occupation: 'Nurse'
        }),
        score: 80,
        status: 'new',
        createdBy: createdBy
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        company: 'Education First',
        email: 'michael.brown@example.com',
        phoneNumbers: JSON.stringify([
          { type: 'mobile', number: '+1234567896', primary: true },
          { type: 'work', number: '+1234567897', primary: false }
        ]),
        address: JSON.stringify({
          street: '654 Maple Ln',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001',
          country: 'USA'
        }),
        demographics: JSON.stringify({
          age: 38,
          gender: 'male',
          income: '80000',
          occupation: 'Teacher'
        }),
        score: 75,
        status: 'new',
        createdBy: createdBy
      }
    ];
    
    // Add each dummy contact
    for (const contactData of dummyContacts) {
      try {
        const contact = await Contact.create(contactData);
        console.log(`Created contact: ${contact.firstName} ${contact.lastName}`);
      } catch (error) {
        console.error(`Error creating contact ${contactData.firstName} ${contactData.lastName}:`, error.message);
      }
    }
    
    console.log('Dummy contacts added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding dummy contacts:', error);
    process.exit(1);
  }
}

addDummyContacts();