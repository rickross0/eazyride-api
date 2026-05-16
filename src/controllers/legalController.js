const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

// GET /legal/terms — returns T&C content
exports.getTerms = async (req, res) => {
  try {
    // Check DB first (admin may have updated it)
    const setting = await prisma.adminSetting.findUnique({ where: { key: 'terms_and_conditions' } });
    if (setting?.value) {
      return res.json({ content: setting.value, source: 'database' });
    }
    // Fallback: read from Legal folder
    const legalPath = path.join(__dirname, '..', '..', 'Legal', 'TERMS-AND-CONDITIONS.md');
    if (fs.existsSync(legalPath)) {
      const content = fs.readFileSync(legalPath, 'utf-8');
      return res.json({ content, source: 'file' });
    }
    return res.json({ content: 'Terms and conditions are being updated. Please check back later.', source: 'default' });
  } catch (err) {
    console.error('Get terms error:', err);
    return res.status(500).json({ error: 'Failed to fetch terms' });
  }
};

// PUT /admin/legal/terms — admin updates T&C content
exports.updateTerms = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const setting = await prisma.adminSetting.upsert({
      where: { key: 'terms_and_conditions' },
      update: { value: content, label: 'Terms & Conditions' },
      create: { key: 'terms_and_conditions', value: content, label: 'Terms & Conditions' },
    });
    return res.json({ success: true, setting });
  } catch (err) {
    console.error('Update terms error:', err);
    return res.status(500).json({ error: 'Failed to update terms' });
  }
};
