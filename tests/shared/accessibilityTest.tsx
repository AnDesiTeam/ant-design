import React from 'react';
import { render } from '@testing-library/react';
import { globSync } from 'glob';
import { axe } from 'jest-axe';

// Create a queue to manage axe calls
let axeRunning = false;
const runAxe = async (...args: Parameters<typeof axe>) => {
  // eslint-disable-next-line no-unmodified-loop-condition
  while (axeRunning) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  axeRunning = true;
  try {
    return await axe(...args);
  } finally {
    axeRunning = false;
  }
};

// eslint-disable-next-line jest/no-export
export default function accessibilityTest(Component: React.ComponentType) {
  beforeAll(() => {
    // Fake ResizeObserver
    global.ResizeObserver = jest.fn(() => {
      return {
        observe() {},
        unobserve() {},
        disconnect() {},
      };
    }) as jest.Mock;

    // fake fetch
    global.fetch = jest.fn(() => {
      return {
        then() {
          return this;
        },
        catch() {
          return this;
        },
        finally() {
          return this;
        },
      };
    }) as jest.Mock;
  });

  beforeEach(() => {
    // Reset all mocks
    if (global.fetch) {
      (global.fetch as jest.Mock).mockClear();
    }
  });

  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe(`accessibility`, () => {
    it(`component does not have any violations`, async () => {
      jest.useRealTimers();
      const { container } = render(<Component />);
      const results = await runAxe(container, {
        rules: {
          'image-alt': { enabled: false },
          label: { enabled: false },
          'button-name': { enabled: false },
          'role-img-alt': { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    }, 10000);
  });
}

type Options = {
  skip?: boolean | string[];
};

// eslint-disable-next-line jest/no-export
export function accessibilityDemoTest(component: string, options: Options = {}) {
  // If skip is true, return immediately without executing any tests
  if (options.skip === true) {
    describe.skip(`${component} demo a11y`, () => {
      it('skipped', () => {});
    });
    return;
  }

  describe(`${component} demo a11y`, () => {
    const files = globSync(`./components/${component}/demo/*.tsx`).filter(
      (file) =>
        !file.includes('_semantic') &&
        !file.includes('-debug') &&
        !file.includes('component-token'),
    );

    files.forEach((file) => {
      const shouldSkip = Array.isArray(options.skip) && options.skip.some((c) => file.endsWith(c));
      const testMethod = shouldSkip ? describe.skip : describe;

      testMethod(`Test ${file} accessibility`, () => {
        const Demo = require(`../../${file}`).default;
        accessibilityTest(Demo);
      });
    });
  });
}
