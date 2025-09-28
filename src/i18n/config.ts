import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

export const resources = {
  en: {
    translation: {
      onboarding: {
        title: 'Missed Prayer Estimator',
        subtitle: 'How many years of prayers do you think you missed?',
        yearsLabel: 'Years without prayers',
        calculate: 'That is roughly {{count}} prayers.',
        adjust: 'Adjust by prayer if you know exact numbers.',
        continue: 'Save and continue',
        acquiringLocation: 'Fetching your location for prayer times…',
        locationPermission: 'Allow location access to calculate prayer times automatically.',
        reset: 'Reset adjustments'
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
        done: 'Done'
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
        subtitle: 'كم سنة تعتقد أنك تركت الصلاة؟',
        yearsLabel: 'عدد السنوات',
        calculate: 'يعادل تقريباً {{count}} صلاة.',
        adjust: 'عدّل لكل صلاة إذا عرفت الأعداد الدقيقة.',
        continue: 'حفظ ومتابعة',
        acquiringLocation: 'جاري تحديد موقعك لأوقات الصلاة…',
        locationPermission: 'اسمح بالوصول للموقع لحساب أوقات الصلاة تلقائياً.',
        reset: 'إعادة التعيين'
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
        done: 'تم'
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
