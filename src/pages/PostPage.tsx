import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import type { Post, Comment as CommentType } from '../types';
import PostPageSkeleton from '../components/PostPageSkeleton';
import { translatePost, translateComment } from '../data/translations';

const PostPage = () => {
  // Получаем ID поста из URL с помощью хука useParams от react-router-dom.
  const { id } = useParams<{ id: string }>();

  // Определяем состояния для хранения данных поста, комментариев, статуса загрузки и ошибок.
  // Состояния для управления UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false); // Флаг для переключения языка

  // Состояния для хранения данных
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [translatedPost, setTranslatedPost] = useState<Post | null>(null);
  const [originalComments, setOriginalComments] = useState<CommentType[]>([]);
  const [translatedComments, setTranslatedComments] = useState<CommentType[]>([]);

  // В зависимости от флага isTranslated, выбираем, какие данные показывать.
  const postToShow = isTranslated ? translatedPost : originalPost;
  const commentsToShow = isTranslated ? translatedComments : originalComments;

  // useEffect для загрузки данных при монтировании компонента или при изменении ID поста в URL.
  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true); // Устанавливаем статус загрузки
      setError(null);   // Сбрасываем предыдущие ошибки
      try {
        // Создаем два параллельных запроса для ускорения загрузки данных.
        const postPromise = axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const commentsPromise = axios.get(`https://jsonplaceholder.typicode.com/posts/${id}/comments`);
        
        // Ожидаем выполнения обоих запросов с помощью Promise.all.
        const [postResponse, commentsResponse] = await Promise.all([postPromise, commentsPromise]);
        
        // Сохраняем оригинальные данные
        setOriginalPost(postResponse.data);
        setOriginalComments(commentsResponse.data);

        // Создаем и сохраняем "переведенные" данные
        setTranslatedPost(translatePost(postResponse.data));
        setTranslatedComments(commentsResponse.data.map(translateComment));

      } catch (e) {
        // В случае ошибки при загрузке, сохраняем сообщение об ошибке.
        setError('Не удалось загрузить данные. Попробуйте снова.');
        console.error('Ошибка при загрузке поста и комментариев:', e);
      } finally {
        // Вне зависимости от результата, убираем статус загрузки.
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]); // Эффект будет перезапускаться, если ID в URL изменится.


  if (loading) {
    return <PostPageSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-4 flex flex-col justify-center items-center">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          &larr; Назад к списку
        </Link>
      </div>
    );
  }

  if (!postToShow) {
    return (
        <div className="bg-gray-900 min-h-screen text-white p-4 flex flex-col justify-center items-center">
          <p className="text-xl mb-4">Пост не найден.</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            &larr; Назад к списку
          </Link>
        </div>
      );
  }

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="bg-gray-900 min-h-screen text-white p-4"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemVariants}>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8 inline-block">
            &larr; Назад к списку
          </Link>
        </motion.div>
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setIsTranslated(!isTranslated)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            {isTranslated ? 'Show Original' : 'Перевести на русский'}
          </button>
        </div>

        {postToShow && (
          <motion.div variants={itemVariants} className="bg-gray-800 rounded-lg p-6 mb-8">
            <h1 className="text-4xl font-bold mb-4 capitalize">{postToShow.title}</h1>
            <p className="text-gray-400 text-lg leading-relaxed">{postToShow.body}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold mt-12 mb-6">Комментарии ({commentsToShow.length})</h2>

          {commentsToShow.length > 0 ? (
            <div className="space-y-4">
              {commentsToShow.map((comment) => (
                <motion.div key={comment.id} variants={itemVariants} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-1 capitalize">{comment.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{comment.email}</p>
                  <p className="text-gray-300">{comment.body}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Комментариев пока нет.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PostPage;
