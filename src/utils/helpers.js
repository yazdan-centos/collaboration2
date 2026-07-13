// تبدیل اعداد لاتین به فارسی
export function toPersianNum(num) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[d]);
}

// رنگ نوار پیشرفت بر اساس درصد
export function getProgressColor(progress) {
  if (progress >= 80) return 'var(--accent)';
  if (progress >= 40) return 'var(--info)';
  if (progress >= 20) return 'var(--warning)';
  return 'var(--danger)';
}
