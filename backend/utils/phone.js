const normalizeIndianPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  const localNumber = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;

  if (!/^[6-9]\d{9}$/.test(localNumber)) {
    return null;
  }

  return `+91${localNumber}`;
};

module.exports = { normalizeIndianPhone };
