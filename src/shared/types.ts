export type Profile = {
  basics: {
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    phone: string;
  };
  location: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    other?: string;
  };
  workExperience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    summary?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills: string[];
};

export type EncryptedData = {
  iv: string;
  data: string;
  salt?: string;
};

export type PlatformType = 'greenhouse' | 'lever' | 'generic';

export type FieldSignature = {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  label: string;
  name: string;
  id: string;
  type: string;
  placeholder: string;
  autocomplete: string;
  ariaLabel: string;
  nearbyText: string;
};

export type FieldMatch = {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  profileKey: string;
  score: number;
  signature: FieldSignature;
};

export type FillResult = {
  filled: number;
  skipped: number;
  errors: string[];
  matches: Array<{
    profileKey: string;
    value: string;
    success: boolean;
  }>;
};

export type Message =
  | { type: 'FILL_PAGE' }
  | { type: 'GET_PROFILE' }
  | { type: 'SAVE_PROFILE'; profile: Profile }
  | { type: 'FILL_RESULT'; result: FillResult }
  | { type: 'DETECT_PLATFORM'; platform: PlatformType };
