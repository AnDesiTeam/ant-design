import { accessibilityDemoTest } from '../../../tests/shared/accessibilityTest';

// wait for rc-segmented、rc-qrcode fix
accessibilityDemoTest('qr-code', { skip: ['errorlevel.tsx', 'download.tsx', 'type.tsx'] });
