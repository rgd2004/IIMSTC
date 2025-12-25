const mongoose = require('mongoose');
const db = require('../server/config/database');

// Connect to DB
db();

// Wait for connection, then update
setTimeout(async () => {
  try {
    const EBook = require('../server/models/EBook');
    
    console.log('📚 Updating all e-books to published=true...');
    
    const result = await EBook.updateMany(
      { published: { $ne: true } }, // Update only those not already true
      { $set: { published: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} e-books`);
    
    // Show all e-books
    const allBooks = await EBook.find({});
    console.log(`\n📖 Total e-books in database: ${allBooks.length}`);
    allBooks.forEach(book => {
      console.log(`  - ${book.title} | Published: ${book.published}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}, 2000);
