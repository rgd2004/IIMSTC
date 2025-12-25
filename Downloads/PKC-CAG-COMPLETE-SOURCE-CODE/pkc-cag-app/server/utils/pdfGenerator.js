const PDFDocument = require('pdfkit');

// Generate a simple PDF for the e-book
exports.generateEbookPDF = (ebook) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Collect the PDF data
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Title
      doc.fontSize(28).font('Helvetica-Bold').text(ebook.title, { align: 'center' });
      doc.moveDown();

      // Author
      if (ebook.author) {
        doc.fontSize(14).font('Helvetica-Oblique').text(`by ${ebook.author}`, { align: 'center' });
      }
      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
      doc.moveDown();

      // Metadata
      doc.fontSize(11).font('Helvetica');
      doc.text(`Category: ${ebook.category}`, { indent: 20 });
      doc.text(`Language: ${ebook.language || 'English'}`, { indent: 20 });
      if (ebook.pages) {
        doc.text(`Pages: ${ebook.pages}`, { indent: 20 });
      }
      doc.moveDown();

      // Description
      if (ebook.description) {
        doc.fontSize(12).font('Helvetica-Bold').text('Description:', { underline: true });
        doc.fontSize(11).font('Helvetica').text(ebook.description, { align: 'justify' });
      }
      doc.moveDown();

      // Footer
      doc.fontSize(9).font('Helvetica').text('This e-book is for personal use only.', 50, doc.page.height - 50, { align: 'center' });
      doc.text('Unauthorized distribution or reproduction is prohibited.', 50, doc.page.height - 30, { align: 'center' });

      // Finalize
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
