// ============================================================
// Settings Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Support Contacts
exports.getSupportContacts = async (req, res, next) => {
  try {
    const contacts = await prisma.supportContact.findMany({ where: { isActive: true }, orderBy: { type: 'asc' } });
    res.json({ success: true, data: contacts });
  } catch (error) { next(error); }
};

exports.createSupportContact = async (req, res, next) => {
  try {
    const contact = await prisma.supportContact.create({ data: req.body });
    res.status(201).json({ success: true, data: contact });
  } catch (error) { next(error); }
};

exports.updateSupportContact = async (req, res, next) => {
  try {
    const contact = await prisma.supportContact.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: contact });
  } catch (error) { next(error); }
};

exports.deleteSupportContact = async (req, res, next) => {
  try {
    await prisma.supportContact.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) { next(error); }
};

// Legal Documents
exports.getLegalDocument = async (req, res, next) => {
  try {
    const doc = await prisma.legalDocument.findUnique({ where: { type: req.params.type } });
    if (!doc) throw new AppError('Document not found', 404);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
};

exports.updateLegalDocument = async (req, res, next) => {
  try {
    const doc = await prisma.legalDocument.upsert({
      where: { type: req.params.type },
      update: { content: req.body.content, version: req.body.version || '3.0.0' },
      create: { type: req.params.type, content: req.body.content, version: req.body.version || '3.0.0' },
    });
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
};

// App Settings
exports.getAppSettings = async (req, res, next) => {
  try {
    const settings = await prisma.adminSetting.findMany();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.updateAppSetting = async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    const setting = await prisma.adminSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
};
