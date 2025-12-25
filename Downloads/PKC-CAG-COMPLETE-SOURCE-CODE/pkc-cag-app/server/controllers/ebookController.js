const EBook = require('../models/EBook');
const EbookPurchase = require('../models/EbookPurchase');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendEbookDeliveryEmail } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ==========================================
// ADMIN: CREATE E-BOOK
// ==========================================
exports.createEBook = async (req, res) => {
  try {
    const { title, description, author, category, price, language, published, averageRating, totalSales, downloads } = req.body;

    console.log('📚 Creating new e-book:', title);
    console.log('📋 Request files:', req.files ? Object.keys(req.files) : 'No files');

    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, price',
      });
    }

    if (!req.files || !req.files.pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required',
      });
    }

    // Get file paths from multer
    const pdfFile = req.files.pdfFile[0];
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;

    console.log('✅ PDF file uploaded:', pdfFile.filename);
    if (coverImage) {
      console.log('✅ Cover image uploaded:', coverImage.filename);
    }

    // Store relative paths in database
    const ebook = await EBook.create({
      title,
      description,
      author: author || 'Admin',
      category,
      price,
      coverImage: coverImage ? `/uploads/ebooks/covers/${coverImage.filename}` : null,
      pdfFile: `/uploads/ebooks/pdfs/${pdfFile.filename}`,
      fileSize: pdfFile.size,
      language,
      createdBy: req.user._id,
      published: published === 'true' || published === true,
      averageRating: Math.max(4.7, Math.min(5, parseFloat(averageRating) || 4.7)), // Min 4.7, Max 5
      totalSales: parseInt(totalSales) || 0,
      totalRevenue: 0, // Initialize to 0
      downloads: parseInt(downloads) || 0,
    });

    console.log('✅ E-Book created:', ebook._id);
    console.log('📚 E-Book published status:', ebook.published);

    res.status(201).json({
      success: true,
      message: 'E-Book created successfully',
      ebook,
    });
  } catch (err) {
    console.error('❌ Create e-book error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create e-book: ' + err.message,
    });
  }
};

// ==========================================
// ADMIN: UPDATE E-BOOK
// ==========================================
exports.updateEBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, category, price, language, published, averageRating, totalSales, downloads, originalPrice, discountedPrice } = req.body;

    console.log('📚 Updating e-book:', id);

    const ebook = await EBook.findById(id);
    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: 'E-Book not found',
      });
    }

    // Update basic fields
    if (title) ebook.title = title;
    if (description) ebook.description = description;
    if (author) ebook.author = author;
    if (category) ebook.category = category;
    if (price) ebook.price = price;
    if (originalPrice) ebook.originalPrice = originalPrice;
    if (discountedPrice) ebook.discountedPrice = discountedPrice;
    if (language) ebook.language = language;
    if (published !== undefined) ebook.published = published === 'true' || published === true;
    
    // Update marketing stats
    if (averageRating !== undefined) ebook.averageRating = Math.max(4.7, Math.min(5, parseFloat(averageRating) || 4.7)); // Min 4.7, Max 5
    if (totalSales !== undefined) ebook.totalSales = parseInt(totalSales) || 0;
    if (downloads !== undefined) ebook.downloads = parseInt(downloads) || 0;

    // Update files if new ones are uploaded
    if (req.files) {
      if (req.files.pdfFile) {
        const pdfFile = req.files.pdfFile[0];
        ebook.pdfFile = `/uploads/ebooks/pdfs/${pdfFile.filename}`;
        ebook.fileSize = pdfFile.size;
        console.log('✅ PDF file updated:', pdfFile.filename);
      }
      if (req.files.coverImage) {
        const coverImage = req.files.coverImage[0];
        ebook.coverImage = `/uploads/ebooks/covers/${coverImage.filename}`;
        console.log('✅ Cover image updated:', coverImage.filename);
      }
    }

    await ebook.save();

    console.log('✅ E-Book updated:', id);

    res.json({
      success: true,
      message: 'E-Book updated successfully',
      ebook,
    });
  } catch (err) {
    console.error('❌ Update e-book error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update e-book: ' + err.message,
    });
  }
};

// ==========================================
// ADMIN: DELETE E-BOOK
// ==========================================
exports.deleteEBook = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting e-book:', id);

    const ebook = await EBook.findByIdAndDelete(id);

    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: 'E-Book not found',
      });
    }

    console.log('✅ E-Book deleted:', id);

    res.json({
      success: true,
      message: 'E-Book deleted successfully',
    });
  } catch (err) {
    console.error('❌ Delete e-book error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete e-book',
    });
  }
};

// ==========================================
// ADMIN: GET ALL E-BOOKS (ADMIN PANEL)
// ==========================================
exports.getAllEBooksAdmin = async (req, res) => {
  try {
    console.log('📚 getAllEBooksAdmin called - fetching all ebooks...');
    const ebooks = await EBook.find({})
      .select('_id title price author category published featured totalSales totalRevenue downloads averageRating createdAt')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${ebooks.length} ebooks`);
    res.json({
      success: true,
      ebooks,
    });
  } catch (err) {
    console.error('❌ Get e-books error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-books',
    });
  }
};

// ==========================================
// USER: GET ALL PUBLISHED E-BOOKS (STOREFRONT)
// ==========================================
exports.getAllEBooks = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    console.log('🔎 getAllEBooks called');
    console.log('  Query params:', { category, search, sort });
    
    // Build the query with proper $and for published + search/category
    let query = [];
    query.push({ published: true });

    if (category) {
      query.push({ category });
    }

    if (search) {
      query.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      });
    }

    const finalQuery = query.length > 1 ? { $and: query } : query[0];

    console.log('  Final query:', JSON.stringify(finalQuery));

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'popular') sortOption = { totalSales: -1 };

    const ebooks = await EBook.find(finalQuery)
      .select('_id title price originalPrice discountedPrice coverImage averageRating totalSales downloads category author pages language description pdfFile')
      .sort(sortOption);

    console.log(`✅ Found ${ebooks.length} published e-books`);
    console.log('  E-books:', ebooks.map(e => ({ title: e.title, price: e.price })));

    res.json({
      success: true,
      ebooks,
    });
  } catch (err) {
    console.error('❌ Get e-books error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-books',
    });
  }
};

// ==========================================
// DEBUG: GET ALL E-BOOKS (including unpublished)
// ==========================================
exports.debugAllEBooks = async (req, res) => {
  try {
    const allEbooks = await EBook.find({});
    console.log(`🔍 DEBUG: Total e-books in database: ${allEbooks.length}`);
    allEbooks.forEach((book, idx) => {
      console.log(`  ${idx + 1}. ${book.title} | Published: ${book.published} | Sales: ${book.totalSales} | Revenue: ${book.totalRevenue} | ID: ${book._id}`);
    });
    
    // Also fetch purchases
    const purchases = await EbookPurchase.find({ paymentStatus: 'completed' });
    console.log(`💳 DEBUG: Completed purchases: ${purchases.length}`);
    purchases.forEach((purchase, idx) => {
      console.log(`  ${idx + 1}. Ebook ID: ${purchase.ebook} | Amount: ${purchase.amount} | Status: ${purchase.paymentStatus}`);
    });
    
    res.json({
      success: true,
      totalEbooks: allEbooks.length,
      totalCompletedPurchases: purchases.length,
      ebooks: allEbooks.map(book => ({
        _id: book._id,
        title: book.title,
        published: book.published,
        category: book.category,
        price: book.price,
        totalSales: book.totalSales || 0,
        totalRevenue: book.totalRevenue || 0,
        downloads: book.downloads || 0,
        averageRating: book.averageRating || 0
      })),
      purchases: purchases.map(p => ({
        _id: p._id,
        ebook: p.ebook,
        amount: p.amount,
        paymentStatus: p.paymentStatus,
        createdAt: p.createdAt
      }))
    });
  } catch (err) {
    console.error('❌ Debug error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// GET SINGLE E-BOOK DETAILS
// ==========================================
exports.getEBook = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📖 getEBook called with id: ${id}`);

    const ebook = await EBook.findById(id);

    if (!ebook || !ebook.published) {
      return res.status(404).json({
        success: false,
        message: 'E-Book not found',
      });
    }

    res.json({
      success: true,
      ebook,
    });
  } catch (err) {
    console.error('❌ Get e-book error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-book',
    });
  }
};

// ==========================================
// CREATE PURCHASE ORDER
// ==========================================
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { ebookId } = req.body;
    const userId = req.user._id;

    console.log('📚 Creating purchase order for e-book:', ebookId);

    const ebook = await EBook.findById(ebookId);

    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: 'E-Book not found',
      });
    }

    // Check if already purchased
    const existingPurchase = await EbookPurchase.findOne({
      user: userId,
      ebook: ebookId,
      paymentStatus: 'completed',
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this e-book',
      });
    }

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(ebook.price * 100), // Convert to paise
      currency: 'INR',
      receipt: 'ebook_' + Date.now(),
    });

    console.log('✅ Razorpay order created:', rzpOrder.id);

    // Create purchase record
    const purchase = await EbookPurchase.create({
      user: userId,
      ebook: ebookId,
      amount: ebook.price,
      orderId: rzpOrder.id,
      paymentStatus: 'pending',
      status: 'pending',
    });

    console.log('✅ Purchase record created:', purchase._id);

    res.json({
      success: true,
      razorpayKey: process.env.RAZORPAY_KEY,
      order: {
        id: rzpOrder.id,
        amount: Math.round(ebook.price * 100), // In paise
        currency: 'INR',
        ebookTitle: ebook.title,
      },
    });
  } catch (err) {
    console.error('❌ Create purchase error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase order: ' + err.message,
    });
  }
};

// ==========================================
// VERIFY PAYMENT & DELIVER E-BOOK
// ==========================================
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    console.log('💳 Verifying payment:', razorpayOrderId);

    // Verify signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpaySignature !== expectedSignature) {
      console.error('❌ Payment verification failed - signature mismatch');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    console.log('✅ Signature verified');

    // Find purchase by order ID
    const purchase = await EbookPurchase.findOne({ orderId: razorpayOrderId });

    if (!purchase) {
      console.error('❌ Purchase not found:', razorpayOrderId);
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    // Update purchase
    purchase.paymentStatus = 'completed';
    purchase.transactionId = razorpayPaymentId;
    purchase.status = 'completed';
    await purchase.save();

    // Get e-book details
    const ebook = await EBook.findById(purchase.ebook);

    if (!ebook) {
      console.error('❌ E-Book not found:', purchase.ebook);
      return res.status(404).json({
        success: false,
        message: 'E-Book not found',
      });
    }

    console.log('📊 Current e-book stats before update:', {
      totalSales: ebook.totalSales,
      totalRevenue: ebook.totalRevenue,
      downloads: ebook.downloads
    });

    // Update e-book stats
    ebook.totalSales += 1;
    ebook.totalRevenue += purchase.amount;
    ebook.downloads += 1;
    await ebook.save();

    console.log('📊 Updated e-book stats:', {
      totalSales: ebook.totalSales,
      totalRevenue: ebook.totalRevenue,
      downloads: ebook.downloads
    });

    // Send email with PDF
    try {
      const user = await require('../models/User').findById(purchase.user);
      await sendEbookDeliveryEmail(user.email, user.name, ebook, purchase._id);
      purchase.emailSent = true;
      purchase.emailSentAt = new Date();
      await purchase.save();
      console.log('✅ E-Book delivery email sent to:', user.email);
    } catch (emailErr) {
      console.error('⚠️ Email sending failed:', emailErr.message);
      // Continue even if email fails
    }

    console.log('✅ Payment verified and e-book delivered');
    console.log('📊 Final e-book stats:', {
      _id: ebook._id,
      title: ebook.title,
      totalSales: ebook.totalSales,
      totalRevenue: ebook.totalRevenue,
      downloads: ebook.downloads
    });

    res.json({
      success: true,
      message: 'Payment verified. E-Book will be sent to your email.',
      purchase,
      ebook: ebook,
    });
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed: ' + err.message,
    });
  }
};

// ==========================================
// GET USER'S PURCHASED E-BOOKS
// ==========================================
exports.getMyEBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('📚 Fetching user e-books:', userId);

    const purchases = await EbookPurchase.find({
      user: userId,
      paymentStatus: 'completed',
    })
      .populate('ebook', '_id title author coverImage createdAt price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      ebooks: purchases,
    });
  } catch (err) {
    console.error('❌ Get my e-books error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your e-books',
    });
  }
};

// ==========================================
// DOWNLOAD E-BOOK
// ==========================================
exports.downloadEBook = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const userId = req.user._id;

    console.log('⬇️ Downloading e-book:', purchaseId);

    const purchase = await EbookPurchase.findById(purchaseId).populate('ebook');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    // Verify ownership
    if (purchase.user.toString() !== userId.toString()) {
      console.error('❌ Unauthorized download attempt');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (purchase.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Purchase not completed',
      });
    }

    // Update download count
    purchase.downloadsCount += 1;
    purchase.lastDownloadedAt = new Date();
    await purchase.save();

    console.log('✅ E-Book download link generated');

    res.json({
      success: true,
      downloadUrl: purchase.ebook.pdfFile,
      ebookTitle: purchase.ebook.title,
    });
  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to download e-book',
    });
  }
};

// ==========================================
// GET ADMIN ANALYTICS
// ==========================================
exports.getEbookAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching e-book analytics');

    const totalEbooks = await EBook.countDocuments({ published: true });
    const totalSales = await EbookPurchase.countDocuments({ paymentStatus: 'completed' });
    const totalRevenue = await EbookPurchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const topEbooks = await EBook.find({ published: true })
      .sort({ totalSales: -1 })
      .limit(5)
      .select('_id title totalSales totalRevenue');

    res.json({
      success: true,
      analytics: {
        totalEbooks,
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0,
        topEbooks,
      },
    });
  } catch (err) {
    console.error('❌ Analytics error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
    });
  }
};
