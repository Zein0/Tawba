import '@/polyfills/intlPluralRules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

export const resources = {
  en: {
    translation: {
      onboarding: {
        title: 'Missed Prayer Estimator',
        subtitle: 'Start by telling us how long you have been away from prayer.',
        languagePrompt: 'Choose the language you understand best.',
        stepLabel: 'Step {{current}} of {{total}}',
        durationLabel: 'How long have you missed prayers?',
        durationHint: 'Select a value and timeframe below to personalise your plan.',
        unitDays: 'Days',
        unitMonths: 'Months',
        unitYears: 'Years',
        calculate: 'That is roughly {{count}} prayers.',
        next: 'Next',
        adjust: 'Fine-tune each prayer below if you know specific counts.',
        continue: 'Save and continue',
        reset: 'Reset adjustments',
        acquiringLocation: 'Fetching your location for accurate prayer times…',
        locationPermission: 'Allow location access to keep your schedule aligned with your city.',
        locationReady: 'Detected location',
        locationUnknown: 'Location not set yet.',
        locationDenied: 'Location permission was denied. You can enable it in system settings.',
        locationError: 'We could not determine your location. Please try again.'
      },
      dashboard: {
        greeting: 'Peace be upon you',
        nextPrayer: 'Next prayer',
        totalRemaining: 'Missed prayers remaining',
        addLog: 'Log prayer',
        viewLogs: 'View logs',
        todaysProgress: "Today's progress",
        prayed: '{{count}} prayed',
        missed: '{{count}} missed today'
      },
      logs: {
        title: 'Prayer logs',
        add: 'Add log',
        edit: 'Edit log',
        delete: 'Delete',
        confirmDelete: 'Delete log?',
        empty: 'No logs yet. Start logging to see your journey.',
        typeCurrent: 'Prayed on time',
        typeQadha: 'Missed prayer repaid',
        countLabel: 'Number of prayers',
        prayerLabel: 'Prayer',
        typeLabel: 'Type',
        timeLabel: 'Logged at',
        dateLabel: 'Date',
        save: 'Save log'
      },
      progress: {
        title: 'Progress',
        repaid: '{{count}} repaid of {{total}}',
        projected: 'At {{average}} per day you will be debt-free by {{date}}',
        projectedUnknown: 'Start logging qadha prayers to see a projection.'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        fontSize: 'Font size',
        theme: 'Theme',
        reminders: 'Prayer reminders',
        location: 'Prayer location',
        enableReminders: 'Enable reminders',
        dark: 'Dark',
        light: 'Light',
        system: 'System',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        arabic: 'Arabic',
        english: 'English',
        updateLocation: 'Update location'
      },
      prayers: {
        fajr: 'Fajr',
        dhuhr: 'Dhuhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha'
      },
      forms: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        done: 'Done',
        back: 'Back'
      },
      notifications: {
        question: 'Did you pray {{prayer}}?',
        no: 'No, add to missed',
        yes: 'Yes',
        qadhaQuestion: 'How many missed prayers did you repay?',
        submit: 'Save',
        skip: 'Skip'
      }
    }
  },
  ar: {
    translation: {
      onboarding: {
        title: 'تقدير الصلوات الفائتة',
        subtitle: 'ابدأ بإخبارنا عن المدة التي تركت فيها الصلاة.',
        languagePrompt: 'اختر اللغة الأنسب لك.',
        stepLabel: 'الخطوة {{current}} من {{total}}',
        durationLabel: 'كم مدة ترك الصلاة؟',
        durationHint: 'أدخل القيمة واختر الإطار الزمني أدناه لتخصيص خطتك.',
        unitDays: 'أيام',
        unitMonths: 'أشهر',
        unitYears: 'سنوات',
        calculate: 'يعادل تقريباً {{count}} صلاة.',
        next: 'التالي',
        adjust: 'يمكنك تعديل عدد كل صلاة إذا كنت تعرف الأعداد الدقيقة.',
        continue: 'حفظ ومتابعة',
        reset: 'إعادة التعيين',
        acquiringLocation: 'جاري تحديد موقعك لأوقات صلاة أدق…',
        locationPermission: 'اسمح بالوصول للموقع لضبط الجدول حسب مدينتك.',
        locationReady: 'تم تحديد الموقع',
        locationUnknown: 'لم يتم تعيين الموقع بعد.',
        locationDenied: 'تم رفض إذن الموقع. يمكنك تفعيله من إعدادات الجهاز.',
        locationError: 'تعذر تحديد موقعك. حاول مرة أخرى.'
      },
      dashboard: {
        greeting: 'السلام عليكم',
        nextPrayer: 'الصلاة القادمة',
        totalRemaining: 'الصلاوات المتبقية',
        addLog: 'تسجيل صلاة',
        viewLogs: 'عرض السجل',
        todaysProgress: 'تقدم اليوم',
        prayed: '{{count}} صلوات أُديت',
        missed: '{{count}} فاتت اليوم'
      },
      logs: {
        title: 'سجل الصلوات',
        add: 'إضافة سجل',
        edit: 'تعديل السجل',
        delete: 'حذف',
        confirmDelete: 'حذف السجل؟',
        empty: 'لم يتم تسجيل أي صلاة بعد.',
        typeCurrent: 'صلاة في وقتها',
        typeQadha: 'قضاء صلاة فائتة',
        countLabel: 'عدد الصلوات',
        prayerLabel: 'الصلاة',
        typeLabel: 'النوع',
        timeLabel: 'الوقت',
        dateLabel: 'التاريخ',
        save: 'حفظ السجل'
      },
      progress: {
        title: 'التقدم',
        repaid: 'تم قضاء {{count}} من أصل {{total}}',
        projected: 'إذا قضيت {{average}} يومياً فستنتهي في {{date}}',
        projectedUnknown: 'ابدأ بتسجيل صلوات القضاء لرؤية التوقع.'
      },
      settings: {
        title: 'الإعدادات',
        language: 'اللغة',
        fontSize: 'حجم الخط',
        theme: 'السمة',
        reminders: 'تنبيهات الصلاة',
        location: 'الموقع',
        enableReminders: 'تفعيل التنبيهات',
        dark: 'داكن',
        light: 'فاتح',
        system: 'النظام',
        small: 'صغير',
        medium: 'متوسط',
        large: 'كبير',
        arabic: 'العربية',
        english: 'الإنجليزية',
        updateLocation: 'تحديث الموقع'
      },
      prayers: {
        fajr: 'الفجر',
        dhuhr: 'الظهر',
        asr: 'العصر',
        maghrib: 'المغرب',
        isha: 'العشاء'
      },
      forms: {
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        done: 'تم',
        back: 'رجوع'
      },
      notifications: {
        question: 'هل صليت {{prayer}}؟',
        no: 'لم أصلِّ، أضفها للفائتة',
        yes: 'نعم',
        qadhaQuestion: 'كم صلاة فائتة قضيت؟',
        submit: 'حفظ',
        skip: 'تخطي'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale.startsWith('ar') ? 'ar' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
