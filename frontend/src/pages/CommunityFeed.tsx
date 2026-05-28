import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  UserCircle,
  Send,
  Search
} from 'lucide-react';
import { Post } from '@/src/types';

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Rajesh Kumar',
    content: 'Just implemented the AI suggested fertilizer mix for my Rice crop. The leaf color has significantly improved in just 4 days! Highly recommend checking your soil metrics here.',
    likes: 24,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    author: 'Sita Devi',
    content: 'Anyone else seeing a price drop in Wheat in the local Mandis? AgriMind AI is showing a downward trend, should I wait to harvest?',
    likes: 12,
    timestamp: '5 hours ago'
  }
];

export const CommunityFeed: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newPostContent, setNewPostContent] = React.useState('');

  const fetchPosts = () => {
    fetch('/api/posts', { credentials: 'include' })
      .then(res => res.json())
      .then(result => {
        if (result.status === 'success') {
          const mappedPosts = result.data.map((p: any) => ({
            id: p._id,
            author: p.user?.fullName || 'Anonymous Farmer',
            content: p.content,
            likes: p.likes?.length || 0,
            timestamp: new Date(p.createdAt).toLocaleDateString()
          }));
          setPosts(mappedPosts.length > 0 ? mappedPosts : mockPosts);
        } else {
          setPosts(mockPosts);
        }
      })
      .catch(err => {
        console.error("Failed to fetch posts:", err);
        setPosts(mockPosts);
      })
      .finally(() => setIsLoading(false));
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    fetch('/api/posts', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       credentials: 'include',
       body: JSON.stringify({ content: newPostContent })
    })
    .then(res => res.json())
    .then(result => {
        if (result.status === 'success') {
           setNewPostContent('');
           fetchPosts();
        }
    })
    .catch(console.error);
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Community Feed</h2>
          <p className="text-zinc-500 mt-1">Connect with other farmers and share insights.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-agro-neon transition-all"
          />
        </div>
      </div>

      <div className="premium-card p-6 bg-white/5 border-white/10">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-agro-neon/10 rounded-2xl flex items-center justify-center border border-agro-neon/20">
            <UserCircle className="w-8 h-8 text-agro-neon" />
          </div>
          <div className="flex-1">
            <textarea 
              placeholder="Share your farming experience..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-agro-neon outline-none resize-none transition-all"
              rows={3}
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handlePost}
                className="bg-agro-neon text-agro-dark px-8 py-3 rounded-xl text-sm font-bold hover:bg-agro-neon/90 transition-all flex items-center gap-2"
              >
                Post <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-zinc-500 py-10 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-agro-neon/30 border-t-agro-neon rounded-full animate-spin mb-4" />
            Loading community feed...
          </div>
        ) : filteredPosts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="premium-card bg-white/5 border-white/10 hover:border-agro-neon/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-agro-neon/10 rounded-2xl flex items-center justify-center text-agro-neon font-bold border border-agro-neon/20">
                  {post.author[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{post.author}</h4>
                  <p className="text-xs text-zinc-500">{post.timestamp}</p>
                </div>
              </div>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>

            <p className="text-zinc-300 text-base leading-relaxed mb-8">
              {post.content}
            </p>

            <div className="flex items-center gap-8 pt-6 border-t border-white/5">
              <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors text-sm font-medium">
                <Heart className="w-5 h-5" /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-zinc-500 hover:text-agro-neon transition-colors text-sm font-medium">
                <MessageSquare className="w-5 h-5" /> Reply
              </button>
              <button className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors text-sm font-medium ml-auto">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
