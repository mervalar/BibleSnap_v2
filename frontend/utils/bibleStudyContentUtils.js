import AsyncStorage from '@react-native-async-storage/async-storage';

/** Format books field for display. */
export function formatBooks(books) {
  if (!books) return 'No reading assigned';
  if (Array.isArray(books)) return books.join(', ');
  if (typeof books === 'string') {
    try {
      const parsed = JSON.parse(books);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch (e) {}
    return books.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  }
  return String(books).replace(/[\[\]"]/g, '').replace(/,/g, ', ');
}

const BOOK_ABBREV = {
  Genesis: 'GEN', Exodus: 'EXO', Leviticus: 'LEV', Numbers: 'NUM',
  Deuteronomy: 'DEU', Joshua: 'JOS', Judges: 'JDG', Ruth: 'RUT',
  '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
  '1 Chronicles': '1CH', '2 Chronicles': '2CH', Ezra: 'EZR', Nehemiah: 'NEH',
  Esther: 'EST', Job: 'JOB', Psalms: 'PSA', Psalm: 'PSA', Proverbs: 'PRO',
  Ecclesiastes: 'ECC', 'Song of Solomon': 'SNG', Isaiah: 'ISA', Jeremiah: 'JER',
  Lamentations: 'LAM', Ezekiel: 'EZK', Daniel: 'DAN', Hosea: 'HOS', Joel: 'JOL',
  Amos: 'AMO', Obadiah: 'OBA', Jonah: 'JON', Micah: 'MIC', Nahum: 'NAM',
  Habakkuk: 'HAB', Zephaniah: 'ZEP', Haggai: 'HAG', Zechariah: 'ZEC', Malachi: 'MAL',
  Matthew: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT', Romans: 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', Galatians: 'GAL', Ephesians: 'EPH',
  Philippians: 'PHP', Colossians: 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', Titus: 'TIT', Philemon: 'PHM', Hebrews: 'HEB',
  James: 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
  '3 John': '3JN', Jude: 'JUD', Revelation: 'REV',
};

function normalizeName(name) {
  return name.toLowerCase().replace(/^the\s+/, '')
    .replace(/\b1st\b|\bfirst\b/g, '1')
    .replace(/\b2nd\b|\bsecond\b/g, '2')
    .replace(/\b3rd\b|\bthird\b/g, '3')
    .trim();
}

/** Parse reading.books and apiBooks into { book: { id, name }, chapter: { number } }. */
export function getBookInfoFromReading(reading, apiBooks) {
  let booksArray = [];
  if (!reading?.books) {
    const defaultId = apiBooks.length > 0
      ? (apiBooks.find((b) => b.name?.toLowerCase().includes('genesis') || b.abbreviation?.toLowerCase().includes('gen'))?.id ?? apiBooks[0]?.id)
      : null;
    return { book: { id: defaultId, name: 'Genesis' }, chapter: { number: '1' } };
  }
  try {
    if (Array.isArray(reading.books)) booksArray = reading.books;
    else if (typeof reading.books === 'string') {
      try {
        const parsed = JSON.parse(reading.books);
        booksArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        booksArray = [reading.books];
      }
    } else booksArray = [reading.books];
  } catch (e) {
    const defaultId = apiBooks.length > 0 ? (apiBooks.find((b) => b.name?.toLowerCase().includes('genesis'))?.id ?? apiBooks[0]?.id) : null;
    return { book: { id: defaultId, name: 'Genesis' }, chapter: { number: '1' } };
  }
  const firstBook = booksArray[0] || '';
  if (!firstBook || firstBook === 'No reading assigned') {
    return { book: { id: 'GEN', name: 'Genesis' }, chapter: { number: '1' } };
  }
  const cleanBook = String(firstBook).replace(/[\[\]"]/g, '').trim();
  let bookName = '';
  let chapterNumber = '1';
  const chapterVerseMatch = cleanBook.match(/(\d+):(\d+)/);
  if (chapterVerseMatch) {
    chapterNumber = chapterVerseMatch[1];
    bookName = cleanBook.substring(0, chapterVerseMatch.index).trim();
  } else {
    const allNumbers = cleanBook.match(/\d+/g);
    if (allNumbers?.length > 0) {
      if (allNumbers.length === 1) {
        const numberStr = allNumbers[0];
        const numberIndex = cleanBook.indexOf(numberStr);
        const wordsBefore = cleanBook.substring(0, numberIndex).trim().split(/\s+/).filter(Boolean).length;
        if (wordsBefore === 0) {
          bookName = cleanBook.trim();
          chapterNumber = '1';
        } else {
          chapterNumber = numberStr;
          bookName = cleanBook.substring(0, numberIndex).trim();
        }
      } else {
        const lastNumber = allNumbers[allNumbers.length - 1];
        chapterNumber = lastNumber;
        bookName = cleanBook.substring(0, cleanBook.lastIndexOf(lastNumber)).trim();
      }
    } else {
      bookName = cleanBook.trim();
      chapterNumber = '1';
    }
  }
  bookName = bookName.replace(/[\s\-:]+$/, '').replace(/\s+/g, ' ').trim();
  bookName = bookName
    .replace(/\bPs\b/i, 'Psalms').replace(/\bPsalm\b/i, 'Psalms').replace(/\bGen\b/i, 'Genesis')
    .replace(/\bExo\b/i, 'Exodus').replace(/\bLev\b/i, 'Leviticus').replace(/\bNum\b/i, 'Numbers')
    .replace(/\bDeut\b/i, 'Deuteronomy').replace(/\b1\s+Sam\b/i, '1 Samuel').replace(/\b2\s+Sam\b/i, '2 Samuel')
    .replace(/\b1\s+Kings?\b/i, '1 Kings').replace(/\b2\s+Kings?\b/i, '2 Kings')
    .replace(/\b1\s+Cor\b/i, '1 Corinthians').replace(/\b2\s+Cor\b/i, '2 Corinthians')
    .trim();
  let bookId = null;
  if (apiBooks.length > 0) {
    let found = apiBooks.find((b) => b.name?.toLowerCase() === bookName.toLowerCase() || b.abbreviation?.toLowerCase() === bookName.toLowerCase());
    if (!found) found = apiBooks.find((b) => b.name?.toLowerCase().includes(bookName.toLowerCase()) || bookName.toLowerCase().includes(b.name?.toLowerCase()));
    if (!found) {
      const norm = normalizeName(bookName);
      found = apiBooks.find((b) => {
        const an = normalizeName(b.name || '');
        return an === norm || an.includes(norm) || norm.includes(an);
      });
    }
    if (found) bookId = found.id;
  }
  if (!bookId && apiBooks.length > 0 && BOOK_ABBREV[bookName]) {
    const abbrev = BOOK_ABBREV[bookName];
    const found = apiBooks.find((b) => b.abbreviation?.toUpperCase() === abbrev.toUpperCase() || b.id?.toUpperCase() === abbrev.toUpperCase());
    if (found) bookId = found.id;
  }
  if (!bookId && apiBooks.length > 0) {
    const genesis = apiBooks.find((b) => b.name?.toLowerCase().includes('genesis') || b.abbreviation?.toLowerCase().includes('gen') || b.id?.toUpperCase() === 'GEN');
    bookId = genesis?.id ?? apiBooks[0]?.id ?? null;
  }
  return {
    book: { id: bookId, name: bookName || 'Genesis' },
    chapter: { number: chapterNumber || '1' },
  };
}

export function formatDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function getVerseReference(reading, language) {
  if (!reading?.main_verse) return '';
  const parts = reading.main_verse.split(' ');
  if (parts.length >= 2) {
    const trans = language === 'french' ? 'LSG' : language === 'swahili' ? 'SWA' : 'NLT';
    return `${parts[0].toUpperCase()} ${parts.slice(1).join(' ')} ${trans}`;
  }
  return reading.main_verse;
}

export function getVerseText(reading) {
  const text = reading?.verse_text || reading?.explanation || '';
  if (reading?.main_verse && text) {
    const m = reading.main_verse.match(/:(\d+)/);
    if (m && !text.startsWith(m[1])) return `${m[1]} ${text}`;
  }
  return text;
}

/** Toggle lesson completion and update progress/streak. */
export async function toggleLessonCompletion(readingId, newChecked, currentProgressRef, onProgressUpdate) {
  if (newChecked) {
    await AsyncStorage.setItem(`lesson_${readingId}_completed_date`, Date.now().toString());
    await AsyncStorage.setItem(`lesson_${readingId}_completed`, 'true');
    const progressMap = JSON.parse(await AsyncStorage.getItem('bibleProgress') || '{}');
    const finalProgress = Math.max(currentProgressRef.current, 100);
    progressMap[readingId] = finalProgress;
    await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
    const completedIds = JSON.parse(await AsyncStorage.getItem('completedStudies') || '[]');
    if (!completedIds.includes(readingId)) { completedIds.push(readingId); await AsyncStorage.setItem('completedStudies', JSON.stringify(completedIds)); }
    const today = new Date().toISOString().split('T')[0];
    const dailyHistory = await AsyncStorage.getItem('dailyReadingHistory');
    const history = dailyHistory ? JSON.parse(dailyHistory) : {};
    history[today] = (history[today] || 0) + 1;
    await AsyncStorage.setItem('dailyReadingHistory', JSON.stringify(history));
    const prevLast = await AsyncStorage.getItem('lastReadingDate');
    let streak = 0;
    if (prevLast) {
      const last = new Date(prevLast);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      last.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayDate - last) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) streak = parseInt((await AsyncStorage.getItem('readingStreak')) || '0', 10) + (daysDiff === 0 ? 0 : 1);
    } else streak = 1;
    await AsyncStorage.setItem('readingStreak', String(streak));
    await AsyncStorage.setItem('lastReadingDate', new Date().toISOString());
    onProgressUpdate?.(100);
  } else {
    await AsyncStorage.removeItem(`lesson_${readingId}_completed_date`);
    await AsyncStorage.removeItem(`lesson_${readingId}_completed`);
    const progressMap = JSON.parse(await AsyncStorage.getItem('bibleProgress') || '{}');
    progressMap[readingId] = 1;
    await AsyncStorage.setItem('bibleProgress', JSON.stringify(progressMap));
    const completedIds = (JSON.parse(await AsyncStorage.getItem('completedStudies') || '[]')).filter((id) => id !== readingId);
    await AsyncStorage.setItem('completedStudies', JSON.stringify(completedIds));
    onProgressUpdate?.(1);
  }
}
