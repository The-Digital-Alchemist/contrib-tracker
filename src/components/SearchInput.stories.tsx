import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SearchInput from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current search value',
    },
    onValueChange: {
      description: 'Callback when search value changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    showClearButton: {
      control: 'boolean',
      description: 'Show clear button when there is text',
    },
    onClear: {
      description: 'Callback when clear button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component for stories
const SearchInputWrapper = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  
  return (
    <div className="w-80">
      <SearchInput
        {...args}
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue);
          console.log('Search value changed:', newValue);
        }}
        onClear={() => {
          setValue('');
          console.log('Search cleared');
        }}
      />
    </div>
  );
};

// Default story
export const Default: Story = {
  render: SearchInputWrapper,
  args: {
    placeholder: 'Search repositories...',
    showClearButton: true,
  },
};

// With initial value
export const WithValue: Story = {
  render: SearchInputWrapper,
  args: {
    value: 'react',
    placeholder: 'Search repositories...',
    showClearButton: true,
  },
};

// Custom placeholder
export const CustomPlaceholder: Story = {
  render: SearchInputWrapper,
  args: {
    placeholder: 'Find your favorite projects...',
    showClearButton: true,
  },
};

// Without clear button
export const NoClearButton: Story = {
  render: SearchInputWrapper,
  args: {
    placeholder: 'Search repositories...',
    showClearButton: false,
  },
};

// Disabled state
export const Disabled: Story = {
  render: SearchInputWrapper,
  args: {
    value: 'Cannot edit this',
    placeholder: 'Search repositories...',
    disabled: true,
    showClearButton: true,
  },
};

// Different sizes demo
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700 mb-1">Small (w-64)</label>
        <SearchInputWrapper args={{ placeholder: 'Small search...' }} />
      </div>
      <div className="w-80">
        <label className="block text-sm font-medium text-gray-700 mb-1">Medium (w-80)</label>
        <SearchInputWrapper args={{ placeholder: 'Medium search...' }} />
      </div>
      <div className="w-96">
        <label className="block text-sm font-medium text-gray-700 mb-1">Large (w-96)</label>
        <SearchInputWrapper args={{ placeholder: 'Large search...' }} />
      </div>
    </div>
  ),
};

// Interactive demo with results
export const WithMockResults: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    
    const mockRepos = [
      'react',
      'react-router',
      'react-native',
      'redux',
      'typescript',
      'javascript',
      'node.js',
      'express',
    ];
    
    const filteredRepos = mockRepos.filter(repo =>
      repo.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return (
      <div className="w-80 space-y-4">
        <SearchInput
          value={searchValue}
          onValueChange={(newValue) => {
            setSearchValue(newValue);
            console.log('Search value changed:', newValue);
          }}
          placeholder="Search repositories..."
          onClear={() => {
            setSearchValue('');
            console.log('Search cleared');
          }}
        />
        
        {searchValue && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Results ({filteredRepos.length})
            </h4>
            {filteredRepos.length > 0 ? (
              <ul className="space-y-1">
                {filteredRepos.map((repo) => (
                  <li key={repo} className="text-sm text-gray-600 px-2 py-1 hover:bg-white rounded">
                    {repo}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No repositories found</p>
            )}
          </div>
        )}
      </div>
    );
  },
}; 