import React from 'react';
import { Link } from 'react-router-dom';
import './ApplicationGuide.css';

const guideSections = [
  {
    id: 'daily-work',
    eyebrow: 'گردش کار روزانه',
    title: 'مدیریت درخواست‌ها و فعالیت‌ها',
    description: 'بخش‌های اصلی برای ثبت، پیگیری و تکمیل کارهای روزانه تیم پشتیبانی.',
    items: [
      {
        title: 'تیکت‌ها',
        path: '/tickets',
        icon: 'fas fa-ticket',
        tone: 'green',
        description: 'مشاهده، جست‌وجو و پیگیری درخواست‌ها از زمان ثبت تا بسته‌شدن.',
      },
      {
        title: 'ایجاد تیکت',
        path: '/tickets/new',
        icon: 'fas fa-plus',
        tone: 'cyan',
        description: 'ثبت یک درخواست جدید همراه با اطلاعات مشتری، شرح و فایل‌های پیوست.',
      },
      {
        title: 'تسک‌ها',
        path: '/tasks',
        icon: 'fas fa-list-check',
        tone: 'purple',
        description: 'برنامه‌ریزی و کنترل فعالیت‌های اجرایی مرتبط با تیکت‌ها و جلسات.',
      },
      {
        title: 'جلسات تیمی',
        path: '/meetings',
        icon: 'fas fa-handshake',
        tone: 'amber',
        description: 'برنامه‌ریزی جلسات، ثبت یادداشت‌ها و تبدیل تصمیم‌ها به تسک.',
      },
      {
        title: 'چت‌روم تیکت',
        path: '/reports',
        icon: 'fas fa-comments',
        tone: 'blue',
        description: 'دسترسی سریع به گفت‌وگوهای مرتبط با تیکت و ادامه مکاتبات تیمی.',
      },
    ],
  },
  {
    id: 'management',
    eyebrow: 'کنترل و مدیریت',
    title: 'مدیریت سازمان و سطح خدمات',
    description: 'ابزارهای مدیریتی برای پایش عملکرد، ساختار تیم و تعهدات خدمت‌رسانی.',
    items: [
      {
        title: 'داشبورد',
        path: '/dashboard',
        icon: 'fas fa-gauge-high',
        tone: 'green',
        description: 'نمای کلی شاخص‌ها، وضعیت فعالیت‌ها و اطلاعات مهم مدیریتی.',
      },
      {
        title: 'قراردادهای SLA',
        path: '/sla-contracts',
        icon: 'fas fa-file-contract',
        tone: 'cyan',
        description: 'تعریف و نگهداری قراردادهای سطح خدمت و زمان‌های پاسخ‌گویی.',
      },
      {
        title: 'اعضای تیم',
        path: '/team',
        icon: 'fas fa-users',
        tone: 'purple',
        description: 'مشاهده اعضا، وضعیت دسترسی و ظرفیت کاری کارشناسان.',
      },
      {
        title: 'مشتریان',
        path: '/clients',
        icon: 'fas fa-building',
        tone: 'amber',
        description: 'مدیریت اطلاعات مشتریان و ارتباط آن‌ها با قراردادها و تیکت‌ها.',
      },
      {
        title: 'کاربران',
        path: '/users',
        icon: 'fas fa-user-shield',
        tone: 'blue',
        description: 'مدیریت حساب‌های کاربری، نقش‌ها و وضعیت دسترسی به سامانه.',
      },
      {
        title: 'سطوح دسترسی',
        path: '/user-permissions',
        icon: 'fas fa-key',
        tone: 'red',
        description: 'تنظیم مجوزهای دقیق هر کاربر برای قابلیت‌های مختلف سامانه.',
      },
    ],
  },
  {
    id: 'tools',
    eyebrow: 'ابزارهای تکمیلی',
    title: 'برنامه‌ریزی و تنظیمات سامانه',
    description: 'دسترسی به ابزارهای جانبی و تنظیمات موردنیاز برای استفاده بهتر از برنامه.',
    items: [
      {
        title: 'تقویم',
        path: '/calendar',
        icon: 'fas fa-calendar-days',
        tone: 'cyan',
        description: 'مرور زمانی رویدادها، برنامه‌ها و فعالیت‌های ثبت‌شده.',
      },
      {
        title: 'پروژه‌ها',
        path: '/projects',
        icon: 'fas fa-diagram-project',
        tone: 'purple',
        description: 'دسته‌بندی و مرور فعالیت‌های مرتبط با پروژه‌های سازمان.',
      },
      {
        title: 'تنظیمات',
        path: '/settings',
        icon: 'fas fa-cog',
        tone: 'amber',
        description: 'تنظیم ظاهر، ترجیحات و گزینه‌های عمومی حساب کاربری.',
      },
      {
        title: 'گالری آیکون‌ها',
        path: '/icons',
        icon: 'fas fa-icons',
        tone: 'green',
        description: 'مرجع آیکون‌های قابل استفاده در بخش‌های مختلف رابط کاربری.',
      },
    ],
  },
];

const defaultRoles = [
  {
    name: 'CUSTOMER',
    label: 'مشتری',
    description: 'به‌صورت پیش‌فرض می‌تواند تیکت ثبت و مشاهده کند و اطلاعات SLA را ببیند.',
    permissions: ['TICKET_CREATE', 'TICKET_READ', 'SLA_READ'],
  },
  {
    name: 'TEAM_MEMBER',
    label: 'کارشناس تیم',
    description: 'به‌صورت پیش‌فرض امکان رسیدگی به تیکت‌ها، مشاهده مشتری و تیم و مدیریت جلسات و تسک‌های مرتبط را دارد.',
    permissions: [
      'TICKET_READ', 'TICKET_UPDATE', 'CUSTOMER_READ', 'SLA_READ', 'TEAM_READ',
      'MEETING_CREATE', 'MEETING_READ', 'MEETING_UPDATE', 'TASK_READ', 'TASK_UPDATE',
    ],
  },
  {
    name: 'TEAM_MANAGER',
    label: 'مدیر تیم',
    description: 'به‌صورت پیش‌فرض تمام مجوزهای تعریف‌شده سامانه را دریافت می‌کند.',
    permissions: ['ALL_PERMISSIONS'],
  },
];

const systemTypes = [
  {
    title: 'اولویت',
    code: 'Priority',
    icon: 'fas fa-arrow-up-wide-short',
    description: 'اولویت پیش‌فرض تیکت و تسک MEDIUM است و میزان فوریت رسیدگی را مشخص می‌کند.',
    values: [
      ['LOW', 'کم', 'رسیدگی عادی بدون فوریت خاص.'],
      ['MEDIUM', 'متوسط · پیش‌فرض', 'سطح استاندارد برای بیشتر درخواست‌ها.'],
      ['HIGH', 'زیاد', 'نیازمند رسیدگی سریع‌تر از حالت عادی.'],
      ['CRITICAL', 'بحرانی', 'اختلال جدی که باید فوراً رسیدگی شود.'],
    ],
  },
  {
    title: 'وضعیت تیکت',
    code: 'TicketStatus',
    icon: 'fas fa-ticket',
    description: 'تیکت جدید با وضعیت UNALLOCATED ساخته می‌شود و در صورت تخصیص کارشناس به ASSIGNED تغییر می‌کند.',
    values: [
      ['UNALLOCATED', 'تخصیص‌نیافته · پیش‌فرض', 'تیکت ثبت شده ولی هنوز کارشناسی برای آن تعیین نشده.'],
      ['ASSIGNED', 'تخصیص‌یافته', 'کارشناس مسئول تعیین شده اما کار هنوز آغاز نشده.'],
      ['IN_PROGRESS', 'در حال انجام', 'کارشناس در حال رسیدگی فعال به تیکت است.'],
      ['RESOLVED', 'حل‌شده', 'راه‌حل ارائه شده و منتظر تأیید نهایی است.'],
      ['CLOSED', 'بسته‌شده', 'تیکت به‌طور کامل بسته و پرونده آن پایان یافته.'],
    ],
  },
  {
    title: 'وضعیت تسک',
    code: 'TaskStatus',
    icon: 'fas fa-list-check',
    description: 'این مقادیر مرحله اجرایی یا نتیجه نهایی هر تسک را مشخص می‌کنند.',
    values: [
      ['OPEN', 'باز', 'تسک ایجاد شده و آماده شروع است.'],
      ['PENDING', 'در انتظار', 'در انتظار پیش‌نیاز یا تصمیم برای ادامه.'],
      ['IN_PROGRESS', 'در حال انجام', 'در حال انجام توسط مسئول تسک.'],
      ['COMPLETED', 'تکمیل‌شده', 'تسک با موفقیت به پایان رسیده است.'],
      ['CANCELLED', 'لغوشده', 'پیش از تکمیل لغو شده است.'],
      ['FAILED', 'ناموفق', 'انجام تسک با شکست مواجه شده است.'],
    ],
  },
  {
    title: 'وضعیت جلسه',
    code: 'MeetingStatus',
    icon: 'fas fa-handshake',
    description: 'وضعیت جلسه چرخه برنامه‌ریزی تا تکمیل یا لغو آن را نمایش می‌دهد.',
    values: [
      ['SCHEDULED', 'برنامه‌ریزی‌شده', 'جلسه تعیین وقت شده و منتظر برگزاری است.'],
      ['IN_PROGRESS', 'در حال برگزاری', 'جلسه هم‌اکنون در حال برگزاری است.'],
      ['COMPLETED', 'تکمیل‌شده', 'جلسه برگزار و به پایان رسیده است.'],
      ['CANCELLED', 'لغوشده', 'جلسه پیش از برگزاری لغو شده است.'],
    ],
  },
  {
    title: 'وضعیت دسترسی کارشناس',
    code: 'AvailabilityStatus',
    icon: 'fas fa-user-clock',
    description: 'این وضعیت برای نمایش آمادگی کارشناس جهت دریافت و رسیدگی به کار استفاده می‌شود.',
    values: [
      ['AVAILABLE', 'آماده', 'آماده دریافت و رسیدگی به کار جدید.'],
      ['BUSY', 'مشغول', 'مشغول کار فعلی و با ظرفیت محدود.'],
      ['OFF_DUTY', 'خارج از شیفت', 'خارج از ساعت کاری یا شیفت تعریف‌شده.'],
      ['UNAVAILABLE', 'در دسترس نیست', 'به‌طور موقت امکان دریافت کار ندارد.'],
    ],
  },
  {
    title: 'پاسخ دعوت جلسه',
    code: 'RsvpStatus',
    icon: 'fas fa-envelope-open-text',
    description: 'پاسخ هر شرکت‌کننده به دعوت جلسه با یکی از این مقادیر نگهداری می‌شود.',
    values: [
      ['PENDING', 'بدون پاسخ', 'هنوز پاسخی به دعوت داده نشده است.'],
      ['ACCEPTED', 'پذیرفته', 'حضور در جلسه تأیید شده است.'],
      ['DECLINED', 'ردشده', 'دعوت رد شده و حضوری نخواهد بود.'],
      ['TENTATIVE', 'احتمالی', 'حضور احتمالی است و قطعیت ندارد.'],
    ],
  },
];


export default function ApplicationGuide() {
  const guideItemCount = guideSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <main className="application-guide">
      <header className="application-guide-hero">
        <div className="application-guide-hero-content">
          <span className="application-guide-kicker">
            <i className="fas fa-compass" aria-hidden="true" />
            راهنمای سریع سامانه
          </span>
          <h1>از هر بخش برنامه چه استفاده‌ای کنیم؟</h1>
          <p>
            در این صفحه کاربرد بخش‌های اصلی سامانه و مسیر پیشنهادی استفاده از هرکدام را
            می‌بینید. برای ورود مستقیم، دکمه مربوط به همان بخش را انتخاب کنید.
          </p>
          <div className="application-guide-summary" aria-label="خلاصه راهنما">
            <span><strong className="fa-num">{guideSections.length}</strong> گروه کاربردی</span>
            <span><strong className="fa-num">{guideItemCount}</strong> بخش قابل دسترس</span>
            <span><strong>دسترسی سریع</strong> به صفحه مقصد</span>
          </div>
        </div>
        <div className="application-guide-hero-icon" aria-hidden="true">
          <i className="fas fa-map-signs" />
        </div>
      </header>

      <nav className="application-guide-nav" aria-label="فهرست بخش‌های راهنما">
        <span>رفتن به:</span>
        {guideSections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
          </a>
        ))}
        <a href="#defaults">مقادیر و دسترسی‌های پیش‌فرض</a>
      </nav>

      {guideSections.map((section, sectionIndex) => (
        <section
          className="application-guide-section"
          id={section.id}
          key={section.id}
          aria-labelledby={`${section.id}-title`}
        >
          <div className="application-guide-section-heading">
            <div className="application-guide-section-number fa-num" aria-hidden="true">
              {sectionIndex + 1}
            </div>
            <div>
              <span>{section.eyebrow}</span>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <p>{section.description}</p>
            </div>
          </div>

          <div className="application-guide-grid">
            {section.items.map((item) => (
              <article className={`application-guide-card tone-${item.tone}`} key={item.path}>
                <div className="application-guide-card-heading">
                  <div className="application-guide-card-icon" aria-hidden="true">
                    <i className={item.icon} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <span className="application-guide-path" dir="ltr">{item.path}</span>
                  </div>
                </div>

                <p>{item.description}</p>

                <Link className="application-guide-link" to={item.path}>
                  ورود به {item.title}
                  <i className="fas fa-arrow-left" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="application-guide-section" id="defaults" aria-labelledby="defaults-title">
        <div className="application-guide-section-heading">
          <div className="application-guide-section-number" aria-hidden="true">
            <i className="fas fa-sliders" />
          </div>
          <div>
            <span>مرجع سامانه</span>
            <h2 id="defaults-title">مقادیر و دسترسی‌های پیش‌فرض</h2>
            <p>این موارد مستقیماً از نقش‌ها و انواع تعریف‌شده در بک‌اند سامانه تهیه شده‌اند.</p>
          </div>
        </div>

        <div className="application-guide-reference-block">
          <div className="application-guide-reference-heading">
            <div>
              <span>RBAC</span>
              <h3>مجوزهای پیش‌فرض نقش‌ها</h3>
            </div>
            <Link to="/user-permissions">مدیریت دسترسی‌ها</Link>
          </div>

          <div className="application-guide-role-grid">
            {defaultRoles.map((role) => (
              <article className="application-guide-role-card" key={role.name}>
                <div>
                  <span>{role.label}</span>
                  <code>{role.name}</code>
                </div>
                <p>{role.description}</p>
                <div className="application-guide-values">
                  {role.permissions.map((permission) => (
                    <code key={permission}>{permission}</code>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="application-guide-reference-block">
          <div className="application-guide-reference-heading">
            <div>
              <span>ENUMS</span>
              <h3>انواع و وضعیت‌های ثابت</h3>
            </div>
          </div>

          <div className="application-guide-types-grid">
            {systemTypes.map((type) => (
              <article className="application-guide-type-card" key={type.code}>
                <div className="application-guide-type-heading">
                  <i className={type.icon} aria-hidden="true" />
                  <div>
                    <h4>{type.title}</h4>
                    <code>{type.code}</code>
                  </div>
                </div>
                <p>{type.description}</p>
                <div className="application-guide-values">
                  {type.values.map(([value, label]) => (
                    <span key={value}>
                      <code>{value}</code>
                      {label}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <aside className="application-guide-note">
        <i className="fas fa-circle-info" aria-hidden="true" />
        <div>
          <strong>نکته دسترسی</strong>
          <p>
            نمایش و امکان استفاده از هر بخش براساس نقش و مجوزهای حساب شما تعیین می‌شود.
            اگر صفحه‌ای در منوی کناری دیده نمی‌شود، سطح دسترسی آن را بررسی کنید.
          </p>
        </div>
        <Link to="/user-permissions">مدیریت دسترسی‌ها</Link>
      </aside>
    </main>
  );
}
