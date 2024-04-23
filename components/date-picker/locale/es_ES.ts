import CalendarLocale from 'rc-picker/lib/locale/es_ES';

import TimePickerLocale from '../../time-picker/locale/es_ES';
import type { PickerLocale } from '../generatePicker';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'Seleccionar fecha',
    rangePlaceholder: ['Fecha inicial', 'Fecha final'],
    shortWeekDays: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    yearFormat: 'YYYY',
    dateFormat: 'DD/MM/YYYY',
    fieldDateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
    shortMonths: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    ...CalendarLocale,
  },
  timePickerLocale: {
    placeholder: 'Seleccionar hora',
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;
