const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'src/content/posts');
const outputPath = path.join(process.cwd(), 'src/lib/posts-data.json');
// 클라이언트 fetch용 public 경로에도 동시 출력
const publicOutputPath = path.join(process.cwd(), 'public/data/posts-data.json');

function formatDate(dateVal) {
  if (!dateVal) return '';
  try {
    let d;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else {
      d = new Date(String(dateVal));
    }
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return String(dateVal);
}

function run() {
  console.log('Running prebuild: generating static posts database...');
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || '',
        date: formatDate(data.date),
        summary: data.summary || '',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        published: data.published !== false,
        content: content,
      };
    });

  // src/lib 경로 (서버 import용)
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`Successfully generated ${posts.length} posts to ${outputPath}`);

  // public/data 경로 (클라이언트 fetch용)
  const publicDir = path.dirname(publicOutputPath);
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(publicOutputPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`Also copied to ${publicOutputPath}`);
}

run();

