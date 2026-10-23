import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'getting-started',
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: ['guides/canvas', 'guides/animation', 'guides/lottie', 'guides/text'],
    },
    'api',
    'platforms',
    'examples',
  ],
};

export default sidebars;
