// داده‌های تسک‌ها
export const tasks = [
  {
    id: 'TSK-1042',
    name: 'طراحی رابط کاربری صفحه ورود',
    desc: 'بازطراحی فرم ورود با پیروی از طراحی جدید',
    status: 'completed',
    priority: 'high',
    assignee: 'سارا احمدی',
    avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
    avatarInit: 'س.ا',
    progress: 100,
    deadline: '1403/09/15',
  },
  {
    id: 'TSK-1043',
    name: 'پیاده‌سازی API مدیریت کاربران',
    desc: 'ایجاد نقاط پایانی REST برای CRUD کاربران',
    status: 'in-progress',
    priority: 'high',
    assignee: 'علی محمدی',
    avatarColor: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    avatarInit: 'ع.م',
    progress: 68,
    deadline: '1403/09/22',
  },
  {
    id: 'TSK-1044',
    name: 'تست یکپارچگی ماژول پرداخت',
    desc: 'اجرای تست‌های E2E روی فرآیند پرداخت',
    status: 'pending',
    priority: 'medium',
    assignee: 'رضا کریمی',
    avatarColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
    avatarInit: 'ر.ک',
    progress: 25,
    deadline: '1403/09/28',
  },
  {
    id: 'TSK-1045',
    name: 'بهینه‌سازی کوئری‌های دیتابیس',
    desc: 'بررسی و بهینه‌سازی کوئری‌های کند گزارش',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'مریم حسینی',
    avatarColor: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    avatarInit: 'م.ح',
    progress: 45,
    deadline: '1403/10/02',
  },
  {
    id: 'TSK-1046',
    name: 'رفع خطای نمایش فاکتور',
    desc: 'خطای محاسبه مالیات بر ارزش افزوده در فاکتورها',
    status: 'failed',
    priority: 'high',
    assignee: 'حسین نوری',
    avatarColor: 'linear-gradient(135deg, #ef4444, #dc2626)',
    avatarInit: 'ح.ن',
    progress: 10,
    deadline: '1403/09/18',
  },
  {
    id: 'TSK-1047',
    name: 'مستندسازی API نسخه ۲',
    desc: 'تدوین مستندات Swagger برای نقاط پایانی جدید',
    status: 'pending',
    priority: 'low',
    assignee: 'زهرا رحیمی',
    avatarColor: 'linear-gradient(135deg, #ec4899, #db2777)',
    avatarInit: 'ز.ر',
    progress: 0,
    deadline: '1403/10/10',
  },
  {
    id: 'TSK-1048',
    name: 'استقرار روی سرور تست',
    desc: 'انتشار نسخه جدید روی محیط استیجینگ',
    status: 'completed',
    priority: 'medium',
    assignee: 'علی محمدی',
    avatarColor: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    avatarInit: 'ع.م',
    progress: 100,
    deadline: '1403/09/12',
  },
  {
    id: 'TSK-1049',
    name: 'پیاده‌سازی سیستم اعلان‌ها',
    desc: 'ایجاد سرویس push notification برای وب',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'سارا احمدی',
    avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
    avatarInit: 'س.ا',
    progress: 55,
    deadline: '1403/10/05',
  },
];

// داده‌های فعالیت‌ها
export const activities = [
  {
    icon: 'fas fa-check-circle',
    color: 'green',
    html: '<strong>سارا احمدی</strong> تسک طراحی رابط کاربری را تکمیل کرد',
    time: '۵ دقیقه پیش',
  },
  {
    icon: 'fas fa-comment',
    color: 'cyan',
    html: '<strong>علی محمدی</strong> نظر جدیدی روی تسک API ثبت کرد',
    time: '۲۳ دقیقه پیش',
  },
  {
    icon: 'fas fa-exclamation-circle',
    color: 'red',
    html: '<strong>حسین نوری</strong> خطای فاکتور را گزارش داد',
    time: '۱ ساعت پیش',
  },
  {
    icon: 'fas fa-user-plus',
    color: 'purple',
    html: '<strong>مدیر سیستم</strong> زهرا رحیمی را به تیم اضافه کرد',
    time: '۲ ساعت پیش',
  },
  {
    icon: 'fas fa-code-branch',
    color: 'amber',
    html: '<strong>مریم حسینی</strong> شاخه بهینه‌سازی را ادغام کرد',
    time: '۳ ساعت پیش',
  },
];

// وضعیت‌ها به فارسی
export const statusLabels = {
  completed: 'تکمیل‌شده',
  'in-progress': 'در حال انجام',
  pending: 'در انتظار',
  failed: 'شکست‌خورده',
};

// اولویت‌ها به فارسی
export const priorityLabels = {
  high: 'بالا',
  medium: 'متوسط',
  low: 'پایین',
};

// آیکون هر اولویت
export const priorityIcons = {
  high: 'fas fa-arrow-up',
  medium: 'fas fa-minus',
  low: 'fas fa-arrow-down',
};

// داده‌های نمودار دایره‌ای توزیع وضعیت
export const donutChartData = [
  { label: 'تکمیل‌شده', value: 42, color: '#10b981' },
  { label: 'در حال انجام', value: 45, color: '#06b6d4' },
  { label: 'در انتظار', value: 34, color: '#f59e0b' },
  { label: 'شکست‌خورده', value: 7, color: '#ef4444' },
];

// آیتم‌های منوی سایدبار (بخش‌بندی‌شده) — هر آیتم به مسیر مربوط به خودش لینک می‌شود
export const navSections = [
 {
  title: 'منوی اصلی',
  items: [
    { icon: 'fas fa-gauge-high', label: 'داشبورد', path: '/dashboard' },
    { icon: 'fas fa-ticket', label: 'تیکت‌ها', path: '/tickets', badge: '۱۲' },
    { icon: 'fas fa-list-check', label: 'تسک‌ها', path: '/tasks', badge: '۱۲' },
    { icon: 'fas fa-diagram-project', label: 'پروژه‌ها', path: '/projects' },
    { icon: 'fas fa-file-contract', label: 'قراردادهای SLA', path: '/sla-contracts' },
    { icon: 'fas fa-calendar-days', label: 'تقویم', path: '/calendar' },
    { icon: 'fas fa-chart-column', label: 'چتروم تیکت', path: '/reports' },
  ]
}
,
  {
    title: 'مدیریت',
    items: [
      { icon: 'fas fa-users', label: 'تیم', path: '/team' },
      { icon: 'fas fa-clients', label: 'مشتریان', path: '/clients' },
      { icon: 'fas fa-file-alt', label: 'اسناد', path: '/documents', badge: '۳', badgeColor: 'var(--warning)' },
      { icon: 'fas fa-cog', label: 'تنظیمات', path: '/settings' },
    ],
  },
];

// همه آیتم‌های منو به‌صورت یک آرایه مسطح (برای جست‌وجوی سریع عنوان صفحه بر اساس مسیر)
export const flatNavItems = navSections.flatMap((section) => section.items);

// کارت‌های آماری بالای صفحه
export const statCards = [
  {
    key: 'statTotal',
    color: 'green',
    icon: 'fas fa-layer-group',
    trend: 'up',
    trendValue: '۱۲٪',
    value: '۱۲۸',
    label: 'کل تسک‌ها',
    delay: 'delay-1',
  },
  {
    key: 'statProgress',
    color: 'cyan',
    icon: 'fas fa-spinner',
    trend: 'up',
    trendValue: '۸٪',
    value: '۴۵',
    label: 'در حال انجام',
    delay: 'delay-2',
  },
  {
    key: 'statPending',
    color: 'amber',
    icon: 'fas fa-clock',
    trend: 'down',
    trendValue: '۳٪',
    value: '۳۴',
    label: 'در انتظار',
    delay: 'delay-3',
  },
  {
    key: 'statFailed',
    color: 'red',
    icon: 'fas fa-exclamation-triangle',
    trend: 'down',
    trendValue: '۵٪',
    value: '۷',
    label: 'شکست‌خورده',
    delay: 'delay-4',
  },
];
