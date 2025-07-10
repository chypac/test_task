import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/PostCardSkeleton';
import usePosts from '../hooks/usePosts';
import type { Post } from '../types';

const HomePage = () => {
  // Состояние для хранения поискового запроса пользователя.
  // Явно указываем тип <string>, чтобы помочь линтеру TypeScript.
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Кастомный хук для получения, фильтрации и пагинации постов.
  const { posts, loading, error, hasMore, loadMore } = usePosts(searchQuery);

  // Используем Intersection Observer для реализации бесконечной прокрутки.
  // Инициализируем ref с null и указываем, что он может содержать IntersectionObserver или null.
  const observer = useRef<IntersectionObserver | null>(null);

  // useCallback для мемоизации функции, которая будет передана в ref последнего элемента.
  // Это предотвращает пересоздание IntersectionObserver при каждом рендере.
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // Небольшая задержка, чтобы предотвратить многократный вызов в StrictMode.
        // Это решает проблему мгновенной загрузки всех постов.
        setTimeout(() => {
            loadMore();
        }, 100);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  // Флаг, который определяет, нужно ли отображать скелетоны.
  // Скелетоны показываются только при первоначальной загрузке, когда постов еще нет.
  const showSkeletons = loading && posts.length === 0;

  // Варианты анимации для контейнера постов.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Поиск постов</h1>
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по заголовку..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {showSkeletons 
            ? Array.from({ length: 12 }).map((_, i) => <PostCardSkeleton key={i} />)
            : posts.map((post: Post, index: number) => {
                const isLastElement = posts.length === index + 1;
                return (
                  <motion.div
                    key={post.id}
                    ref={isLastElement ? lastPostElementRef : null}
                    variants={itemVariants}
                  >
                    <PostCard post={post} />
                  </motion.div>
                );
              })
          }
        </motion.div>

        {loading && posts.length > 0 && <p className="text-center mt-4">Загрузка...</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        {!loading && !error && posts.length > 0 && !hasMore && (
          <p className="text-center text-gray-400 mt-4">Вы просмотрели все посты.</p>
        )}
        {posts.length === 0 && !loading && !error && (
          <p className="text-center text-gray-400">Ничего не найдено.</p>
        )}

      </div>
    </div>
  );
}

export default HomePage;
