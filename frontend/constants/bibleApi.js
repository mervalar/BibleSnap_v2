export const API_KEY = 'e6cf9d533a33b82907ee2ba5d94a6e3b';

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'english', bibleId: '65eec8e0b60e656b-01' },
  { label: 'French', value: 'french', bibleId: 'a93a92589195411f-01' },
  { label: 'Swahili', value: 'swahili', bibleId: '611f8eb23aec8f13-01' },
];

export const stripHtml = (html) => (!html ? '' : html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
