import '@testing-library/jest-dom'
import { render, type RenderResult } from '@testing-library/react'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveStyle(style: Record<string, any>): R
      toBeVisible(): R
      toBeDisabled(): R
      toHaveValue(value: string | number | string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
    }
  }

  interface Window {
    matchMedia: (query: any) => any & {
      matches: boolean
      media: string
      onchange: null
      addListener: jest.Mock
      removeListener: jest.Mock
      addEventListener: jest.Mock
      removeEventListener: jest.Mock
      dispatchEvent: jest.Mock
    }
  }
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Custom test utilities
export const waitForLoadingToFinish = async () => {
  return await new Promise(resolve => setTimeout(resolve, 0))
}

export const mockFetch = (data: any) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    })
  )
}

export const mockFetchError = (error: string) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error })
    })
  )
}

export const mockFetchNetworkError = () => {
  return jest
    .fn()
    .mockImplementation(() => Promise.reject(new Error('Network error')))
}

export const renderWithProviders = (ui: React.ReactElement): RenderResult => {
  // Add any providers needed for testing here
  return render(ui)
}

// Mock data generators
export const generateMockProfile = () => ({
  id: 'test-id',
  personalDetails: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'PREFER_NOT_TO_SAY' as const,
    publicProfileId: 'johndoe'
  },
  workExperiences: [],
  education: [],
  skills: [],
  languages: []
})

export const generateMockWorkExperience = () => ({
  id: 'exp-1',
  companyName: 'Test Company',
  jobDesignation: 'Software Engineer',
  employmentType: 'FULL_TIME' as const,
  startDate: '2020-01',
  endDate: '2023-01',
  isCurrentJob: false,
  skills: ['React', 'TypeScript'],
  description: 'Test description'
})

export const generateMockEducation = () => ({
  id: 'edu-1',
  degreeName: 'Bachelor of Science',
  specialization: 'Computer Science',
  instituteName: 'Test University',
  examBoard: 'Test Board',
  state: 'Test State',
  city: 'Test City',
  passingYear: '2020',
  isCurrentlyStudying: false,
  grade: 'A'
})
