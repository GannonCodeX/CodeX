// Descriptions and destinations checked against the publishers on September 8, 2026.
// These starter links need no CMS records; officer-published resources join the same collection.
export const curatedResources = [
  {
    _id: 'starter-cs50', title: 'CS50: start with the fundamentals', provider: 'Harvard University',
    description: 'Learn how to think through a problem, then turn it into code. Lectures, exercises, and a final project take you from the basics to building something of your own.',
    url: 'https://cs50.harvard.edu/x/', resourceType: 'course', difficulty: 'beginner',
    tags: ['Programming', 'Python'], featured: true,
  },
  {
    _id: 'starter-github', title: 'Your first GitHub contribution', provider: 'GitHub Skills',
    description: 'Practice branches, commits, and pull requests in a small hands-on exercise. A useful first step before working on a club project. Requires a GitHub account.',
    url: 'https://github.com/skills/introduction-to-github', resourceType: 'course', difficulty: 'beginner',
    tags: ['Git & teamwork'], featured: true,
  },
  {
    _id: 'starter-mdn', title: 'Build your first website', provider: 'MDN Web Docs',
    description: 'Get comfortable with HTML, CSS, and JavaScript through the MDN learning curriculum. Start with a simple page and build up your frontend skills.',
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development', resourceType: 'guide', difficulty: 'beginner',
    tags: ['Web development'], featured: true,
  },
  {
    _id: 'cs50-video', title: 'CS50 on YouTube', provider: 'CS50',
    description: 'Prefer to watch? Explore programming lectures and explanations from CS50, and revisit the concepts you want to understand better.',
    url: 'https://www.youtube.com/@cs50', resourceType: 'video', difficulty: 'beginner', tags: ['Programming'],
  },
  {
    _id: 'react-learn', title: 'Get started with React', provider: 'React',
    description: 'Work through components, events, and state with interactive examples. A good next step once you know the basics of JavaScript.',
    url: 'https://react.dev/learn', resourceType: 'guide', difficulty: 'intermediate', tags: ['Web development', 'React'],
  },
  {
    _id: 'python-tutorial', title: 'The Python tutorial', provider: 'Python Software Foundation',
    description: 'The official tour of Python: syntax, data structures, modules, and more. Best if you already understand basic programming and want to learn Python.',
    url: 'https://docs.python.org/3/tutorial/', resourceType: 'guide', difficulty: 'intermediate', tags: ['Programming', 'Python'],
  },
  {
    _id: 'huggingface-course', title: 'Understand language models', provider: 'Hugging Face',
    description: 'Explore language models and the Hugging Face ecosystem, with practical examples using Transformers and datasets. Bring a solid foundation in Python.',
    url: 'https://huggingface.co/learn/llm-course/chapter1/1', resourceType: 'course', difficulty: 'intermediate', tags: ['AI & machine learning', 'Python'],
  },
  {
    _id: 'mlh-organizer', title: 'Plan a hackathon', provider: 'Major League Hacking',
    description: 'A practical reference for student organizers covering the work behind running a hackathon. Useful when planning an event with the club.',
    url: 'https://guide.mlh.com/', resourceType: 'guide', difficulty: 'all', tags: ['Hackathons', 'Event planning'],
  },
].map(resource => ({ ...resource, librarySection: 'learn', accessLevel: 'public' }))
