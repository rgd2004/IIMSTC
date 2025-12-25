const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/ebooks'),
  path.join(__dirname, '../uploads/ebooks/pdfs'),
  path.join(__dirname, '../uploads/ebooks/covers'),
  path.join(__dirname, '../uploads/job-assistant'),
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created upload directory: ${dir}`);
  }
});

// Configure storage for e-books
const ebookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdfFile') {
      const pdfDir = path.join(__dirname, '../uploads/ebooks/pdfs');
      cb(null, pdfDir);
    } else if (file.fieldname === 'coverImage') {
      const coverDir = path.join(__dirname, '../uploads/ebooks/covers');
      cb(null, coverDir);
    } else {
      cb(null, path.join(__dirname, '../uploads/ebooks'));
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for e-books
const ebookFileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdfFile') {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for pdfFile'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for coverImage'), false);
    }
  } else {
    cb(null, true);
  }
};

// Create multer instance for e-books
const ebookUpload = multer({
  storage: ebookStorage,
  fileFilter: ebookFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// General file upload storage (for job assistant, etc.)
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/job-assistant');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// General file filter
const generalFileFilter = (req, file, cb) => {
  // Allow PDF, DOC, DOCX
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

// General upload instance
const upload = multer({
  storage: generalStorage,
  fileFilter: generalFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = {
  ebookUpload,
  upload,
  uploadDirs
};
