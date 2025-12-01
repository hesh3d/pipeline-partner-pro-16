import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'ar';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Translations
const translations: Record<Locale, Record<string, string>> = {
  en: {
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export CSV',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.any': 'Any',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.signout': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.welcome': 'Welcome to CraftFolio',
    'auth.subtitle': 'Find local leads without websites',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.searchLeads': 'Search Leads',
    'nav.listLeads': 'List Leads',
    'nav.savedLeads': 'Saved Leads',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.leadsWorth': 'Leads Worth',
    'dashboard.totalSearches': 'Total Searches',
    'dashboard.leadsFound': 'Leads Found',
    'dashboard.citiesSearched': 'Cities Searched',
    'dashboard.dealsClosed': 'Deals Closed',
    'dashboard.conversionFunnel': 'Conversion Funnel',
    'dashboard.savedByCity': 'Saved Leads by City',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.adjustAssumptions': 'Adjust assumptions',
    'dashboard.closeRate': 'Close Rate',
    'dashboard.avgProjectValue': 'Avg Project Value',
    'dashboard.stageDistribution': 'Stage Distribution',
    'dashboard.revenueByStage': 'Revenue by Stage',
    'dashboard.nextActions': 'Next Actions',
    'dashboard.searches': 'Searches',
    'dashboard.identified': 'Identified',
    'dashboard.saved': 'Saved',
    'dashboard.closed': 'Closed',
    
    // Search
    'search.title': 'Search Leads',
    'search.niche': 'Niche',
    'search.selectNiche': 'Select niche',
    'search.customNiche': 'Custom Niche',
    'search.customNichePlaceholder': 'Enter custom niche',
    'search.country': 'Country',
    'search.selectCountry': 'Select country',
    'search.city': 'City',
    'search.selectCity': 'Select city',
    'search.keyword': 'Keyword',
    'search.keywordPlaceholder': 'Optional keyword',
    'search.minRating': 'Min Rating',
    'search.stars': 'Stars',
    'search.hasWebsite': 'Has Website',
    'search.advancedFilters': 'Advanced Filters',
    'search.openNow': 'Open Now',
    'search.minReviews': 'Min Reviews',
    'search.hasWhatsApp': 'Has WhatsApp',
    'search.hasInstagram': 'Has Instagram',
    'search.hasBooking': 'Has Booking',
    'search.priceRange': 'Price Range',
    'search.includeSocialMedia': 'Social Media Links',
    'search.doesNotMatter': 'Doesn\'t Matter',
    'search.anyRating': 'Any Rating',
    'search.hasWebsiteYes': 'Has Website',
    'search.hasWebsiteNo': 'No Website',
    'search.searchLeads': 'Search Leads',
    'search.locationPicker': 'Location Picker',
    'search.mapPicker': 'Pick Location on Map',
    'search.mapPickerHint': 'Click on the map to set search center',
    'search.searchRadius': 'Search Radius',
    'search.searchCriteria': 'Search Criteria',
    'search.findYourNextOpportunity': 'Find your next opportunity',
    'search.loadingMap': 'Loading map...',
    'search.mapError': "Can't load Google Maps. Check API key or billing.",
    'search.mapRetry': 'Retry',
    'search.basicInfo': 'Basic Information',
    'common.hideAdvanced': 'Hide Advanced Filters',
    
    // Leads
    'leads.title': 'Leads',
    'leads.business': 'Business',
    'leads.contact': 'Contact',
    'leads.rating': 'Rating',
    'leads.status': 'Status',
    'leads.actions': 'Actions',
    'leads.noWebsite': 'No Website Detected',
    'leads.generatePitch': 'Generate AI Pitch',
    'leads.regenerate': 'Regenerate',
    'leads.pipelineStatus': 'Pipeline Status',
    'leads.workStatus': 'Work Status',
    'leads.proposalSent': 'Proposal Sent',
    'leads.websiteCompleted': 'Website Completed',
    'leads.closedWon': 'Closed-Won',
    'leads.dealSpecifics': 'Deal Specifics',
    'leads.firstMeeting': 'First Meeting Date',
    'leads.dealPrice': 'Deal Price',
    'leads.source': 'Source',
    'leads.campaign': 'Campaign',
    'leads.notes': 'Lead Notes',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile & Agency',
    'settings.preferences': 'Preferences',
    'settings.revenue': 'Revenue Assumptions',
    'settings.webhooks': 'Webhooks',
    'settings.api': 'Developer API',
    'settings.integrations': 'Integrations',
    'settings.dangerZone': 'Danger Zone',
    'settings.defaultCountry': 'Default Country',
    'settings.currency': 'Currency',
    'settings.darkMode': 'Dark Mode',
    'settings.weeklyEmails': 'Weekly Email Reports',
    'settings.density': 'Display Density',
    'settings.webhookUrl': 'Primary Webhook URL',
    'settings.testWebhook': 'Test Webhook',
    'settings.apiKey': 'Your API Secret Key',
    'settings.generateKey': 'Generate Key',
    'settings.clearData': 'Clear All Data',
  },
  ar: {
    'common.loading': 'جارٍ التحميل...',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير CSV',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.add': 'إضافة',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.any': 'أي',
    
    // Auth
    'auth.signin': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.signout': 'تسجيل الخروج',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.welcome': 'مرحبًا بك في CraftFolio',
    'auth.subtitle': 'ابحث عن عملاء محليين بدون موقع',
    
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.searchLeads': 'البحث عن عملاء',
    'nav.listLeads': 'قائمة العملاء',
    'nav.savedLeads': 'العملاء المحفوظون',
    'nav.settings': 'الإعدادات',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.leadsWorth': 'قيمة العملاء',
    'dashboard.totalSearches': 'إجمالي البحث',
    'dashboard.leadsFound': 'العملاء المكتشفون',
    'dashboard.citiesSearched': 'المدن المبحوثة',
    'dashboard.dealsClosed': 'الصفقات المغلقة',
    'dashboard.conversionFunnel': 'مسار التحويل',
    'dashboard.savedByCity': 'العملاء المحفوظون حسب المدينة',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.adjustAssumptions': 'تعديل الافتراضات',
    'dashboard.closeRate': 'معدل الإغلاق',
    'dashboard.avgProjectValue': 'متوسط قيمة المشروع',
    'dashboard.stageDistribution': 'توزيع المراحل',
    'dashboard.revenueByStage': 'الإيرادات حسب المرحلة',
    'dashboard.nextActions': 'الإجراءات التالية',
    'dashboard.searches': 'عمليات بحث',
    'dashboard.identified': 'تم التعرف عليها',
    'dashboard.saved': 'محفوظة',
    'dashboard.closed': 'مغلقة',
    
    // Search
    'search.title': 'البحث عن عملاء',
    'search.niche': 'المجال',
    'search.selectNiche': 'اختر المجال',
    'search.customNiche': 'مجال مخصص',
    'search.customNichePlaceholder': 'أدخل مجال مخصص',
    'search.country': 'البلد',
    'search.selectCountry': 'اختر البلد',
    'search.city': 'المدينة',
    'search.selectCity': 'اختر المدينة',
    'search.keyword': 'الكلمة المفتاحية',
    'search.keywordPlaceholder': 'كلمة مفتاحية اختيارية',
    'search.minRating': 'الحد الأدنى للتقييم',
    'search.stars': 'نجوم',
    'search.hasWebsite': 'لديه موقع',
    'search.advancedFilters': 'فلاتر متقدمة',
    'search.openNow': 'مفتوح الآن',
    'search.minReviews': 'الحد الأدنى للمراجعات',
    'search.hasWhatsApp': 'لديه واتساب',
    'search.hasInstagram': 'لديه إنستغرام',
    'search.hasBooking': 'لديه حجز',
    'search.priceRange': 'نطاق السعر',
    'search.includeSocialMedia': 'روابط التواصل الاجتماعي',
    'search.doesNotMatter': 'لا يهم',
    'search.anyRating': 'أي تقييم',
    'search.hasWebsiteYes': 'لديهم موقع',
    'search.hasWebsiteNo': 'ليس لديهم موقع',
    'search.searchLeads': 'ابحث عن عملاء',
    'search.locationPicker': 'اختيار الموقع',
    'search.mapPicker': 'اختر الموقع على الخريطة',
    'search.mapPickerHint': 'انقر على الخريطة لتحديد مركز البحث',
    'search.searchRadius': 'نطاق البحث',
    'search.searchCriteria': 'معايير البحث',
    'search.findYourNextOpportunity': 'ابحث عن فرصتك القادمة',
    'search.loadingMap': 'جارٍ تحميل الخريطة...',
    'search.mapError': 'تعذّر تحميل خرائط جوجل. تحقّق من المفتاح أو الفوترة.',
    'search.mapRetry': 'إعادة المحاولة',
    'search.basicInfo': 'المعلومات الأساسية',
    'common.hideAdvanced': 'إخفاء الفلاتر المتقدمة',
    
    // Leads
    'leads.title': 'العملاء',
    'leads.business': 'النشاط التجاري',
    'leads.contact': 'التواصل',
    'leads.rating': 'التقييم',
    'leads.status': 'الحالة',
    'leads.actions': 'الإجراءات',
    'leads.noWebsite': 'لا يوجد موقع',
    'leads.generatePitch': 'إنشاء عرض بالذكاء الاصطناعي',
    'leads.regenerate': 'إعادة الإنشاء',
    'leads.pipelineStatus': 'حالة خط الأنابيب',
    'leads.workStatus': 'حالة العمل',
    'leads.proposalSent': 'تم إرسال العرض',
    'leads.websiteCompleted': 'تم إكمال الموقع',
    'leads.closedWon': 'صفقة مغلقة',
    'leads.dealSpecifics': 'تفاصيل الصفقة',
    'leads.firstMeeting': 'تاريخ الاجتماع الأول',
    'leads.dealPrice': 'سعر الصفقة',
    'leads.source': 'المصدر',
    'leads.campaign': 'الحملة',
    'leads.notes': 'ملاحظات العميل',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.profile': 'الملف الشخصي والوكالة',
    'settings.preferences': 'التفضيلات',
    'settings.revenue': 'افتراضات الإيرادات',
    'settings.webhooks': 'الروابط الآلية',
    'settings.api': 'API المطورين',
    'settings.integrations': 'التكاملات',
    'settings.dangerZone': 'منطقة الخطر',
    'settings.defaultCountry': 'البلد الافتراضي',
    'settings.currency': 'العملة',
    'settings.darkMode': 'الوضع الداكن',
    'settings.weeklyEmails': 'تقارير البريد الأسبوعية',
    'settings.density': 'كثافة العرض',
    'settings.webhookUrl': 'رابط الويب هوك الأساسي',
    'settings.testWebhook': 'اختبار الويب هوك',
    'settings.apiKey': 'مفتاح API السري الخاص بك',
    'settings.generateKey': 'إنشاء مفتاح',
    'settings.clearData': 'مسح جميع البيانات',
  },
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    // Return default values if context is not available yet
    console.warn('useI18n called outside I18nProvider, using defaults');
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      dir: 'ltr' as 'ltr' | 'rtl',
    };
  }
  return context;
};