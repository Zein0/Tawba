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
        nextPrayerAt: 'Scheduled at {{time}}',
        totalRemaining: 'Missed prayers remaining',
        addLog: 'Log prayer',
        viewLogs: 'View logs',
        todaysProgress: "Today's progress",
        prayed: '{{count}} prayed',
        missed: '{{count}} missed today',
        locationLine: 'You are in {{location}}'
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
        save: 'Save log',
        duplicateTitle: 'Already logged',
        duplicateMessage: 'You have already logged this prayer today.',
        errorTitle: 'Something went wrong',
        errorMessage: 'We could not save this log. Please try again.',
        singleCount: '1 prayer'
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
        updateLocation: 'Update location',
        resolvingLocation: 'Resolving address…',
        resetTitle: 'Reset all data?',
        resetMessage: 'This will clear your progress and take you back to the start.',
        resetCancel: 'Cancel',
        resetConfirm: 'Reset',
        resetDataTitle: 'Start over',
        resetDataDescription: 'Clear every log and estimate to restart onboarding.',
        resetButton: 'Reset app'
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
        yesOnTime: 'Yes, prayed on time',
        logQadha: 'Log qadha',
        qadhaQuestion: 'How many missed prayers did you repay?',
        submit: 'Save',
        skip: 'Skip',
        alreadyLoggedTitle: 'Already logged',
        alreadyLoggedBody: 'You already logged {{prayer}} today.',
        errorTitle: 'Could not save log',
        errorBody: 'Please try again in a moment.'
      },
      prayerTimes: {
        title: 'Prayer schedule',
        shortTitle: 'Prayer times',
        location: 'Based on {{location}}',
        locationUnknown: 'Location not set yet.',
        loading: 'Updating prayer times…',
        errors: {
          'location-permission': 'Allow location access in settings to get accurate times.',
          'no-location': 'We could not detect your location. Try updating it from Settings.',
          unknown: 'Something went wrong while fetching prayer times.'
        },
        upNext: 'Up next',
        updateHint: 'Keep your location updated to ensure accurate times.',
        manageLocation: 'Manage location'
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
        nextPrayerAt: 'موعدها {{time}}',
        totalRemaining: 'الصلاوات المتبقية',
        addLog: 'تسجيل صلاة',
        viewLogs: 'عرض السجل',
        todaysProgress: 'تقدم اليوم',
        prayed: '{{count}} صلوات أُديت',
        missed: '{{count}} فاتت اليوم',
        locationLine: 'أنت في {{location}}'
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
        save: 'حفظ السجل',
        duplicateTitle: 'مُسجل مسبقاً',
        duplicateMessage: 'لقد سجلت هذه الصلاة اليوم بالفعل.',
        errorTitle: 'حدث خطأ',
        errorMessage: 'تعذر حفظ السجل. حاول مرة أخرى.',
        singleCount: 'صلاة واحدة'
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
        updateLocation: 'تحديث الموقع',
        resolvingLocation: 'جاري تحديد العنوان…',
        resetTitle: 'إعادة تعيين جميع البيانات؟',
        resetMessage: 'سيتم مسح تقدمك وإعادتك للبداية.',
        resetCancel: 'إلغاء',
        resetConfirm: 'إعادة',
        resetDataTitle: 'البدء من جديد',
        resetDataDescription: 'سيتم حذف السجلات والتقديرات للعودة للإعداد الأولي.',
        resetButton: 'إعادة تعيين التطبيق'
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
        yesOnTime: 'نعم، في وقتها',
        logQadha: 'تسجيل قضاء',
        qadhaQuestion: 'كم صلاة فائتة قضيت؟',
        submit: 'حفظ',
        skip: 'تخطي',
        alreadyLoggedTitle: 'مُسجل مسبقاً',
        alreadyLoggedBody: 'لقد سجلت {{prayer}} اليوم.',
        errorTitle: 'تعذر حفظ السجل',
        errorBody: 'حاول مرة أخرى لاحقاً.'
      },
      prayerTimes: {
        title: 'جدول الصلاة',
        shortTitle: 'أوقات الصلاة',
        location: 'حسب {{location}}',
        locationUnknown: 'لم يتم تعيين الموقع بعد.',
        loading: 'جاري تحديث أوقات الصلاة…',
        errors: {
          'location-permission': 'فعّل إذن الموقع من الإعدادات للحصول على أوقات دقيقة.',
          'no-location': 'تعذر تحديد موقعك. جرّب تحديثه من الإعدادات.',
          unknown: 'حدث خطأ أثناء جلب أوقات الصلاة.'
        },
        upNext: 'الصلاة القادمة',
        updateHint: 'حدّث موقعك باستمرار لضمان دقة الأوقات.',
        manageLocation: 'إدارة الموقع'
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
