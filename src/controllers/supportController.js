const prisma = require('../config/prisma');

// GET /support/contacts — returns support contact info
exports.getContacts = async (req, res) => {
  try {
    const keys = ['support_phone', 'support_whatsapp', 'support_email'];
    const settings = await prisma.adminSetting.findMany({ where: { key: { in: keys } } });
    const contacts = {
      phone: settings.find(s => s.key === 'support_phone')?.value || '',
      whatsapp: settings.find(s => s.key === 'support_whatsapp')?.value || '',
      email: settings.find(s => s.key === 'support_email')?.value || '',
    };
    return res.json(contacts);
  } catch (err) {
    console.error('Get support contacts error:', err);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// PUT /admin/support/contacts — admin updates support contacts
exports.updateContacts = async (req, res) => {
  try {
    const { phone, whatsapp, email } = req.body;
    const updates = [];
    if (phone !== undefined) {
      updates.push(prisma.adminSetting.upsert({
        where: { key: 'support_phone' },
        update: { value: phone, label: 'Support Phone' },
        create: { key: 'support_phone', value: phone, label: 'Support Phone' },
      }));
    }
    if (whatsapp !== undefined) {
      updates.push(prisma.adminSetting.upsert({
        where: { key: 'support_whatsapp' },
        update: { value: whatsapp, label: 'Support WhatsApp' },
        create: { key: 'support_whatsapp', value: whatsapp, label: 'Support WhatsApp' },
      }));
    }
    if (email !== undefined) {
      updates.push(prisma.adminSetting.upsert({
        where: { key: 'support_email' },
        update: { value: email, label: 'Support Email' },
        create: { key: 'support_email', value: email, label: 'Support Email' },
      }));
    }
    await Promise.all(updates);
    return res.json({ success: true });
  } catch (err) {
    console.error('Update support contacts error:', err);
    return res.status(500).json({ error: 'Failed to update contacts' });
  }
};
