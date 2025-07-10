import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link to={`/post/${post.id}`} className="block bg-gray-800 rounded-lg p-4 flex flex-col justify-between h-full hover:bg-gray-700 transition-colors duration-200">
      <div>
        <h2 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h2>
        <p className="text-gray-400 text-sm line-clamp-4">{post.body}</p>
      </div>
      <div className="mt-4 text-right">
        <span className="text-blue-400 text-sm font-semibold">Подробнее →</span>
      </div>
    </Link>
  );
};

export default PostCard;
