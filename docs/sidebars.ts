import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'getting-started',
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        'components/overview',
        'components/shapes',
        'components/paint',
        'components/scene',
        'components/gradients',
        'components/masking',
        'components/picture',
        'components/text',
        'components/animation',
      ],
    },
    {
      type: 'category',
      label: 'WebCanvas API',
      collapsed: false,
      items: ['guides/canvas', 'guides/animation', 'guides/lottie', 'guides/text'],
    },
    {
      type: 'category',
      label: 'Views',
      collapsed: false,
      items: ['views/lottie-view', 'views/svg-view'],
    },
    'api',
    'platforms',
    'examples',
  ],
};

export default sidebars;
