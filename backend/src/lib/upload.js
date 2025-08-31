const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

// Cria as pastas se não existirem
[uploadsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'avatar', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fname = `${base}-${Date.now()}${ext}`;
    cb(null, fname);
  }
});

const upload = multer({ storage });

module.exports = upload;
module.exports.upload = upload;
module.exports.uploadsDir = uploadsDir;
module.exports.avatarsDir = avatarsDir;
