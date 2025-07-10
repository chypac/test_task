import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Post } from '../types';

const POSTS_PER_PAGE = 12;

// Кастомный хук для управления логикой постов: загрузка, фильтрация, пагинация.
const usePosts = (searchQuery: string) => {
  // Состояния:
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Хранит ВСЕ посты, загруженные с API.
  const [posts, setPosts] = useState<Post[]>([]); // Посты, отображаемые на текущей странице.
  const [page, setPage] = useState(1); // Текущая страница для пагинации.
  const [hasMore, setHasMore] = useState(true); // Есть ли еще посты для загрузки.
  const [loading, setLoading] = useState(true); // Статус первоначальной загрузки.
  const [error, setError] = useState<string | null>(null); // Сообщение об ошибке.

  // useEffect для первоначальной загрузки всех постов с API.
  // Запускается только один раз при монтировании компонента, т.к. массив зависимостей пуст.
  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Загружаем все 100 постов с сервера.
        const response = await axios.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
        // Сохраняем посты в их оригинальном виде.
        setAllPosts(response.data);
      } catch (e) {
        setError('Не удалось загрузить посты.');
        console.error('Ошибка при загрузке всех постов:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  // useMemo для мемоизации отфильтрованного списка постов.
  // Фильтрация происходит на клиенте по заголовку и телу поста.
  // Пересчитывается только при изменении `allPosts` или `searchQuery`.
  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return allPosts; // Если поиск пуст, возвращаем все посты.
    }
    return allPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPosts, searchQuery]);

  // useEffect для сброса и загрузки постов при изменении поискового запроса
  useEffect(() => {
    setPosts([]); // Сбрасываем посты при изменении поиска.
    setPage(1); // Возвращаемся на первую страницу.
    setHasMore(true); // Говорим, что есть еще посты для загрузки.
    if (filteredPosts.length > 0) {
      setPosts(filteredPosts.slice(0, POSTS_PER_PAGE)); // Загружаем первые посты.
      setHasMore(filteredPosts.length > POSTS_PER_PAGE); // Проверяем, есть ли еще посты.
    }
  }, [searchQuery, filteredPosts]);

  // useEffect для загрузки следующей страницы
  useEffect(() => {
    // Не загружаем первую страницу дважды
    if (page > 1) {
      const start = (page - 1) * POSTS_PER_PAGE;
      const end = start + POSTS_PER_PAGE;
      setPosts(prevPosts => [...prevPosts, ...filteredPosts.slice(start, end)]);
      setHasMore(filteredPosts.length > end);
    }
  }, [page, filteredPosts]);

  // Функция для загрузки следующей "страницы" постов.
  const loadMore = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return { loading, error, posts, hasMore, loadMore };
};

export default usePosts;
