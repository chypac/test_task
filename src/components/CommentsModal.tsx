import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Comment } from '../types';

interface CommentsModalProps {
  postId: number;
  onClose: () => void;
}

const CommentsModal = ({ postId, onClose }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        setComments(response.data);
      } catch (err) {
        setError('Не удалось загрузить комментарии');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику внутри окна
      >
        <h2 className="text-2xl font-bold mb-4">Комментарии</h2>
        {loading && <p>Загрузка комментариев...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="space-y-4">
            {comments.map(comment => (
              <li key={comment.id} className="bg-gray-700 p-4 rounded-lg">
                <p className="font-bold text-blue-400">{comment.name} ({comment.email})</p>
                <p className="text-gray-300 mt-1">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
        {comments.length === 0 && !loading && !error && <p>Комментариев пока нет.</p>}
      </div>
    </div>
  );
};

export default CommentsModal;
