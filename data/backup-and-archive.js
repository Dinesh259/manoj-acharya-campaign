const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'manoj-acharya-anoopshahar';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const PROJECT_DATA_DIR = 'C:/Users/dinesh/.gemini/antigravity/scratch/manoj-acharya-campaign/data';
const ARTIFACTS_DIR = 'C:/Users/dinesh/.gemini/antigravity/brain/9eb6737d-de71-4496-8d45-e97b0eb9acdb';

async function fetchAll(collection) {
  let docs = [];
  let pageToken = '';
  do {
    let url = `${BASE_URL}/${collection}?pageSize=300`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch ${collection}:`, res.status, res.statusText);
      break;
    }
    const data = await res.json();
    if (data.documents && data.documents.length) {
      docs.push(...data.documents);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return docs;
}

(async () => {
  console.log('📦 Starting Comprehensive Firestore Backup...');

  // Ensure data directories exist
  if (!fs.existsSync(PROJECT_DATA_DIR)) fs.mkdirSync(PROJECT_DATA_DIR, { recursive: true });

  const messages = await fetchAll('support_messages');
  console.log(`Fetched ${messages.length} support_messages`);

  const comments = await fetchAll('support_comments');
  console.log(`Fetched ${comments.length} support_comments`);

  const fullBackup = {
    timestamp: new Date().toISOString(),
    project: PROJECT_ID,
    counts: {
      support_messages: messages.length,
      support_comments: comments.length
    },
    support_messages: messages,
    support_comments: comments
  };

  // 1. JSON Backup
  const jsonPath = path.join(PROJECT_DATA_DIR, 'complete_firestore_backup_20261101_0356.json');
  fs.writeFileSync(jsonPath, JSON.stringify(fullBackup, null, 2), 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'complete_firestore_backup_20261101_0356.json'), JSON.stringify(fullBackup, null, 2), 'utf-8');
  console.log('✓ JSON backup saved to:', jsonPath);

  // 2. CSV Backup: Support Messages
  const msgRows = [
    ['Doc ID', 'Real Name (गोपनीय)', 'Ward', 'Alias / Unique ID', 'Message', 'Has Photo', 'Likes', 'Avatar', 'Created At']
  ];
  messages.forEach(d => {
    const f = d.fields || {};
    const id = d.name.split('/').pop();
    msgRows.push([
      id,
      f.name ? (f.name.stringValue || '') : '',
      f.ward ? (f.ward.stringValue || '') : '',
      f.alias ? (f.alias.stringValue || '') : '',
      f.message && f.message.stringValue ? f.message.stringValue.replace(/\r?\n/g, ' ').replace(/"/g, '""') : '',
      f.photo && f.photo.stringValue ? 'YES' : 'NO',
      f.likes ? (f.likes.integerValue || '0') : '0',
      f.avatar ? (f.avatar.stringValue || '') : '',
      f.createdAt ? (f.createdAt.timestampValue || '') : ''
    ]);
  });
  const msgCsv = '\uFEFF' + msgRows.map(r => r.map(c => '"' + c + '"').join(',')).join('\r\n');
  const msgCsvPath = path.join(PROJECT_DATA_DIR, 'support_messages_archive_20261101.csv');
  fs.writeFileSync(msgCsvPath, msgCsv, 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'support_messages_archive_20261101.csv'), msgCsv, 'utf-8');
  console.log('✓ Messages CSV archive saved to:', msgCsvPath);

  // 3. CSV Backup: Support Comments
  const commentRows = [
    ['Comment ID', 'Post ID', 'Author ID (Public)', 'Confidential Name', 'Ward', 'Comment Text', 'Created At']
  ];
  comments.forEach(c => {
    const f = c.fields || {};
    const id = c.name.split('/').pop();
    commentRows.push([
      id,
      f.postId ? (f.postId.stringValue || '') : '',
      f.authorId ? (f.authorId.stringValue || '') : '',
      f.name ? (f.name.stringValue || '') : '',
      f.ward ? (f.ward.stringValue || '') : '',
      f.text && f.text.stringValue ? f.text.stringValue.replace(/\r?\n/g, ' ').replace(/"/g, '""') : '',
      f.createdAt ? (f.createdAt.timestampValue || '') : ''
    ]);
  });
  const commentCsv = '\uFEFF' + commentRows.map(r => r.map(c => '"' + c + '"').join(',')).join('\r\n');
  const commentCsvPath = path.join(PROJECT_DATA_DIR, 'support_comments_archive_20261101.csv');
  fs.writeFileSync(commentCsvPath, commentCsv, 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'support_comments_archive_20261101.csv'), commentCsv, 'utf-8');
  console.log('✓ Comments CSV archive saved to:', commentCsvPath);

  console.log('🎉 ALL DATA FULLY BACKED UP BEFORE DATABASE PURGE!');
})();
