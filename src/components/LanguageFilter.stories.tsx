import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import LanguageFilter from './LanguageFilter';

const meta: Meta<typeof LanguageFilter> = {
  title: 'Components/LanguageFilter',
  component: LanguageFilter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dropdown component to filter repositories by programming language.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected language (empty string for "All Languages")',
    },
    onValueChange: {
      action: 'language-changed',
      description: 'Callback when language selection changes',
    },
    availableLanguages: {
      control: 'object',
      description: 'Array of available languages to show in dropdown',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Custom placeholder text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock language data based on common Canonical repositories
const mockLanguages = [
  'C',
  'C++',
  'Go',
  'JavaScript',
  'Python',
  'Shell',
  'TypeScript',
  'YAML'
];

export const Default: Story = {
  args: {
    value: '',
    availableLanguages: mockLanguages,
    disabled: false,
  },
};

export const WithSelection: Story = {
  args: {
    value: 'Python',
    availableLanguages: mockLanguages,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    availableLanguages: mockLanguages,
    disabled: true,
  },
};

export const EmptyLanguages: Story = {
  args: {
    value: '',
    availableLanguages: [],
    disabled: false,
  },
};

export const FewLanguages: Story = {
  args: {
    value: '',
    availableLanguages: ['Go', 'Python'],
    disabled: false,
  },
};

// Interactive demo showing state management
export const Interactive: Story = {
  render: (args) => {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    
    return (
      <div className="w-80 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Language Filter Demo</h3>
          <LanguageFilter
            {...args}
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          />
        </div>
        
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Selected:</strong> {selectedLanguage || 'All Languages'}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <strong>Available:</strong> {args.availableLanguages?.length || 0} languages
          </p>
        </div>
        
        {selectedLanguage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔍 Filtering repositories by <strong>{selectedLanguage}</strong>
            </p>
          </div>
        )}
      </div>
    );
  },
  args: {
    availableLanguages: mockLanguages,
    disabled: false,
  },
}; 