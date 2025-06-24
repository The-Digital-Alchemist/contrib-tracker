import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Pagination from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Ubuntu-style pagination component with Previous/Next buttons and smart page number display. Features hover effects, accessibility support, and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'The currently active page number',
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages available',
    },
    totalCount: {
      control: { type: 'number', min: 0 },
      description: 'Total number of items across all pages',
    },
    pageSize: {
      control: { type: 'number', min: 1 },
      description: 'Number of items per page',
    },
    hasNextPage: {
      control: 'boolean',
      description: 'Whether there is a next page available',
    },
    hasPrevPage: {
      control: 'boolean',
      description: 'Whether there is a previous page available',
    },
  },
  args: {
    onPageChange: fn(),
    onNext: fn(),
    onPrev: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to calculate boolean values based on current/total pages
const createArgs = (currentPage: number, totalPages: number, totalCount: number, pageSize: number = 30) => ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage: currentPage < totalPages,
  hasPrevPage: currentPage > 1,
});

export const Default: Story = {
  args: createArgs(1, 10, 300, 30),
  parameters: {
    docs: {
      description: {
        story: 'Default pagination state showing first page of 10 total pages.',
      },
    },
  },
};

export const MiddlePage: Story = {
  args: createArgs(5, 10, 300, 30),
  parameters: {
    docs: {
      description: {
        story: 'Pagination in the middle of the range, showing smart page number truncation.',
      },
    },
  },
};

export const LastPage: Story = {
  args: createArgs(10, 10, 300, 30),
  parameters: {
    docs: {
      description: {
        story: 'Last page state with disabled Next button.',
      },
    },
  },
};

export const SinglePage: Story = {
  args: createArgs(1, 1, 25, 30),
  parameters: {
    docs: {
      description: {
        story: 'Single page scenario - pagination component should not render when there\'s only one page.',
      },
    },
  },
};

export const TwoPages: Story = {
  args: createArgs(1, 2, 60, 30),
  parameters: {
    docs: {
      description: {
        story: 'Two pages scenario showing minimal pagination.',
      },
    },
  },
};

export const ManyPages: Story = {
  args: createArgs(15, 50, 1500, 30),
  parameters: {
    docs: {
      description: {
        story: 'Large dataset with many pages, demonstrating ellipsis and smart truncation.',
      },
    },
  },
};

export const NearEndPages: Story = {
  args: createArgs(48, 50, 1500, 30),
  parameters: {
    docs: {
      description: {
        story: 'Near the end of a large page set, showing how ellipsis appears on the left.',
      },
    },
  },
};

export const SmallDataset: Story = {
  args: createArgs(2, 3, 75, 30),
  parameters: {
    docs: {
      description: {
        story: 'Small dataset with just a few pages - no ellipsis needed.',
      },
    },
  },
};

export const FirstPageDisabled: Story = {
  args: createArgs(1, 5, 150, 30),
  parameters: {
    docs: {
      description: {
        story: 'First page with disabled Previous button, showing proper disabled state styling.',
      },
    },
  },
};

export const LastPageDisabled: Story = {
  args: createArgs(5, 5, 150, 30),
  parameters: {
    docs: {
      description: {
        story: 'Last page with disabled Next button, showing proper disabled state styling.',
      },
    },
  },
};

export const LargePageSize: Story = {
  args: createArgs(3, 20, 2000, 100),
  parameters: {
    docs: {
      description: {
        story: 'Pagination with larger page size (100 items per page).',
      },
    },
  },
};

export const ExactlySevenPages: Story = {
  args: createArgs(4, 7, 210, 30),
  parameters: {
    docs: {
      description: {
        story: 'Exactly 7 pages - shows all page numbers without ellipsis.',
      },
    },
  },
};

export const EightPages: Story = {
  args: createArgs(4, 8, 240, 30),
  parameters: {
    docs: {
      description: {
        story: 'Just over 7 pages - demonstrates when ellipsis starts appearing.',
      },
    },
  },
};

export const Playground: Story = {
  args: createArgs(5, 20, 600, 30),
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - adjust the controls to test different pagination states.',
      },
    },
  },
};

export const ResponsiveDemo: Story = {
  args: createArgs(12, 25, 750, 30),
  parameters: {
    docs: {
      description: {
        story: 'Responsive design demonstration. Resize your viewport to see how pagination adapts on mobile devices.',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
}; 