import React from 'react';
import { render } from 'enzyme';
import mountTest from '../../../tests/shared/mountTest';
import rtlTest from '../../../tests/shared/rtlTest';

import { Footer } from '..';
import { DefaultAppLayoutProvider } from '../../layout';
import { ThemeProvider } from '../../style/themes/varnish';

describe('Footer', () => {
  mountTest(Footer);
  rtlTest(Footer);

  describe('variants', () => {
    it('default', () => {
      const wrapper = render(
        <ThemeProvider>
          <DefaultAppLayoutProvider layoutVariant="app">
            <Footer />
          </DefaultAppLayoutProvider>
        </ThemeProvider>,
      );
      expect(wrapper).toMatchSnapshot();
    });

    it('dark', () => {
      const wrapper = render(
        <ThemeProvider>
          <Footer variant="dark" />
        </ThemeProvider>,
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
